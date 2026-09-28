const express = require('express')
const path = require("path");
const mongoose = require("mongoose");

const memberController = require('./../controllers/members.controller')
const { authJwt } = require('./../middlewares')


const router = express.Router();

// Every route below needs a logged-in user. Deleting a member additionally
// needs the admin role, since that's the one action that destroys data.
router.use(authJwt.verifyToken)

router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
});

router.route('/')
.get(memberController.getAllMembers)
.post( memberController.addMember)



router.route('/:id')
.get(memberController.getMember)
.patch(memberController.updateMember)
.delete(authJwt.isAdmin, memberController.deleteMember)

router.route('/card/:id')
.get(memberController.generateCard);

module.exports = router;

