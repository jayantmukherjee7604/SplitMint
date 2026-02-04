const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  createGroup,
  getGroups,
  deleteGroup,
  addParticipant,
  deleteParticipant,
} = require("../controllers/group.controller");


router.post("/", auth, createGroup);
router.get("/", auth, getGroups);
router.delete("/:id", auth, deleteGroup);
router.post("/:id/participants", auth, addParticipant);
router.delete("/:id/participants/:pid", auth, deleteParticipant);


module.exports = router;
