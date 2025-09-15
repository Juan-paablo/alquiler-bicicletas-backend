const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'nombre, email y password son requeridos' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'El email ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ nombre, email, password: hash });

    const token = jwt.sign(
      { id: user._id, email: user.email, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { _id: user._id, email: user.email, nombre: user.nombre }
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ message: 'Error registrando usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email y password son requeridos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user._id, email: user.email, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { _id: user._id, email: user.email, nombre: user.nombre }
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Error iniciando sesión' });
  }
};

exports.me = async (req, res) => {
  try {
    // req.user viene del middleware
    res.json({ user: req.user });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ message: 'Error' });
  }
};
