const express = require('express')
const path = require("path");

const memberController = require('./../controllers/members.controller')


const router = express.Router();

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
.delete(memberController.deleteMember)

router.route('/card/:id')
.get(memberController.generateCard);

module.exports = router;

