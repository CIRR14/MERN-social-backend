const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("Cant update this account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("Cant delete this account");
  }
});

// get user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// follow user
router.put("/:id/follow", async (req, res) => {
  const userFollowing = req.body.userId;
  const userToFollow = req.params.id;
  if (userFollowing !== userToFollow) {
    try {
      const user = await User.findById(userToFollow);
      const currentUser = await User.findById(userFollowing);
      if (!user.followers.includes(userFollowing)) {
        // follow
        await user.updateOne({ $push: { followers: userFollowing } });
        await currentUser.updateOne({ $push: { followings: userToFollow } });
        res.status(200).json("User has been followed");
      } else {
        // already following
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    // following yourself
    res.status(403).json("You cannot follow yourself");
  }
});

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
  const userUnfollowing = req.body.userId;
  const userToUnfollow = req.params.id;
  if (userUnfollowing !== userToUnfollow) {
    try {
      const user = await User.findById(userToUnfollow);
      const currentUser = await User.findById(userUnfollowing);
      if (user.followers.includes(userUnfollowing)) {
        // unfollow
        await user.updateOne({ $pull: { followers: userUnfollowing } });
        await currentUser.updateOne({ $pull: { followings: userToUnfollow } });
        res.status(200).json("User has been unfollowed");
      } else {
        // already not following
        res.status(403).json("You dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    // unfollowing yourself
    res.status(403).json("You cannot unfollow yourself");
  }
});

module.exports = router;
