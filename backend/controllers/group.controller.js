const Group = require("../models/Group");
const Participant = require("../models/Participant");


// CREATE GROUP
exports.createGroup = async (req, res) => {
  const { name, participants } = req.body;

  const group = await Group.create({
    name,
    owner: req.user,
  });

  const createdParticipants = [];

  // add participants (max 3)
  for (let p of participants.slice(0, 3)) {
    const participant = await Participant.create({
      name: p.name,
      color: p.color,
      group: group._id,
    });

    createdParticipants.push(participant._id);
  }

  group.participants = createdParticipants;
  await group.save();

  res.json(group);
};



// GET MY GROUPS
exports.getGroups = async (req, res) => {
  const groups = await Group.find({ owner: req.user }).populate("participants");
  res.json(groups);
};



// DELETE GROUP (cascade)
exports.deleteGroup = async (req, res) => {
  const { id } = req.params;

  await Participant.deleteMany({ group: id });
  await Group.findByIdAndDelete(id);

  res.json({ msg: "Group deleted" });
};

// ============================
// ADD PARTICIPANT
// ============================
exports.addParticipant = async (req, res) => {
  const { id } = req.params; // group id
  const { name } = req.body;

  const participant = await Participant.create({
    name,
    group: id,
  });

  await Group.findByIdAndUpdate(id, {
    $push: { participants: participant._id },
  });

  res.json(participant);
};



// ============================
// DELETE PARTICIPANT
// ============================
exports.deleteParticipant = async (req, res) => {
  const { id, pid } = req.params;

  await Participant.findByIdAndDelete(pid);

  await Group.findByIdAndUpdate(id, {
    $pull: { participants: pid },
  });

  res.json({ msg: "Participant removed" });
};

