const express = require('express')
const path = require("path");

const memberController = require('./../controllers/members.controller')
const { authJwt } = require('./../middlewares')


const router = express.Router();

// Every route below needs a logged-in user. Deleting a member additionally
// needs the admin role, since that's the one action that destroys data.
router.use(authJwt.verifyToken)

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

