// /api/communities.js
module.exports = (req, res) => {
  res.json([
    { id: 1, name: "IT Students Hub", members: "1,034", icon: "code-2" },
    { id: 2, name: "Science Explorers", members: "876", icon: "flask-conical" },
    { id: 3, name: "Math Wizards", members: "642", icon: "sigma" },
    { id: 4, name: "Gaming Galaxy", members: "512", icon: "gamepad-2" }
  ]);
};
