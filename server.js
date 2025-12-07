const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MongoUri = ''; //insert yours

const app = express();
const { Schema } = mongoose;

const store = new MongoDBStore({
  uri: MongoUri,
  collection: 'sessions'
});

store.on('error', (err) => {
  console.error('Error MongoDBStore: ', err);
});

app.use(session({
  secret: 'very-secret-key', //insert yours
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    //secure: true, //not available on local network
    sameSite: 'lax'
  },
  rolling: true
}));

const fsFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(fsFolder)) {
    fs.mkdirSync(fsFolder, { recursive: true });
}

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const WorkSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    desc: { type: String, default: 'No description' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ext: { type: String, required: true },
    images: { type: [String], required: true },
    downloads: { type: Number, default: 0 },
    downloadedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String }
});

const WorkModel = mongoose.model('Work', WorkSchema);
const UserModel = mongoose.model('User', UserSchema);

const uploadWork = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'images', maxCount: 2 }
]);

app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email){
      return res.status(400).json({message: 'None data!'})
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserModel({
      username,
      password: hashedPassword,
      email
    });

    await newUser.save();

    req.session.userId = newUser._id.toString();
    req.session.username = newUser.username;
    req.session.email = newUser.email;

    res.status(201).json({message: 'User created'});
  } catch(err){
    console.log('Error: ', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required!' });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.email = user.email;

    return res.json({ message: 'Login successful' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/isTaken', async (req, res) => {
  try {
    const { item, type } = req.body;

    if (!item || !type) {
      return res.status(400).json({ message: 'Item and type are required!' });
    }

    const exist = await UserModel.findOne({ [type]: item });

    if (exist){
      res.json(true);
    } else if (!exist) {
      res.json(false);
    }
  } catch(err){
    console.log('Error!')
  }
});

app.post('/works', uploadWork, async (req, res) => {
  try {
    const { title, desc, type } = req.body;
    const file = req.files['file']?.[0];
    const images = req.files['images'] || [];

    if (!title || !type || !file) {
      return res.status(400).json({ message: 'Title, type, and file are required!' });
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.bin';

    const newWork = new WorkModel({
      title,
      desc: desc || 'No description',
      author: req.session.userId,
      type,
      ext,
      images: []
    });

    await newWork.save();

    let filePath;
    if (newWork.type === 'model') {
      filePath = path.join(fsFolder, 'models', newWork._id.toString(), newWork._id.toString() + ext);
    } else if (newWork.type === 'project') {
      filePath = path.join(fsFolder, 'projects', newWork._id.toString(), newWork._id.toString() + ext);
    } else {
      return res.status(400).json({ message: 'Unknown type' });
    }

    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, file.buffer);

    const imagePaths = [];
    for (let i = 0; i < images.length; i++) {
      const imgName = `${i + 1}.jpg`;
      const imgPath = path.join(dir, imgName);

      await sharp(images[i].buffer)
        .jpeg({ quality: 80 })
        .toFile(imgPath);

      imagePaths.push(imgName);
    }

    newWork.images = imagePaths;
    await newWork.save();

    res.status(201).json({
      message: 'Work and files saved',
      work: newWork
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/getWorks', async (req, res) => {
  const userId = req.session.userId;

  const allWorks = await WorkModel.find().populate('author', 'username');

  res.json({
    works: allWorks,
    userId: userId
  });
});

app.get('/api/me', (req, res) => {
  if (req.session.userId){
    return res.json({
      loggedIn: true,
      username: req.session.username,
      userId: req.session.userId,
      email: req.session.email
    });
  }
  res.json({loggedIn: false});
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err){
      return res.status(500).json({ message: 'Server error' });
    } 
    res.json({message: 'Successfully logout!'});
  });
});

app.post('/change', async (req, res) => {
  const user = await UserModel.findById(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: 'Unknown session' });
  }

  const { changeItem, value } = req.body;

  const allowedFields = ['username', 'email'];

  if (!allowedFields.includes(changeItem)) {
    return res.status(400).json({ message: 'Invalid field to update' });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.session.userId,
      { [changeItem]: value },
      { 
        new: true,
        runValidators: true,
        context: 'query'      
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (changeItem === 'username' || changeItem === 'email') {
      req.session[changeItem] = updatedUser[changeItem];
      await new Promise((resolve, reject) => {
        req.session.save(err => (err ? reject(err) : resolve()));
      });
    }

    res.json({ success: true, [changeItem]: updatedUser[changeItem] });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Update failed' });
  }
});

app.post('/delete', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await new Promise((resolve, reject) => {
      req.session.destroy(err => (err ? reject(err) : resolve()));
    });

    res.json({ message: 'Account deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/enter', async (req, res) => {
  try {
    if (req.session.userId){
      res.json(true);
    } else {
      res.json(false);
    }
  } catch(err){
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/download', async (req, res) => {
  try {
    const { workId } = req.body;
    const userId = req.session.userId;

    if (!workId || !userId) {
      return res.status(400).json({ success: false, message: 'Missing workId or not logged in' });
    }

    const work = await WorkModel.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    const alreadyDownloaded = work.downloadedBy.some(id => id.toString() === userId);
    if (alreadyDownloaded) {
      return res.json({ success: false, message: 'Already downloaded' });
    }

    work.downloadedBy.push(userId);
    work.downloads += 1;
    await work.save();

    return res.json({ success: true, downloads: work.downloads });

  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

mongoose.connect('')  //insert yours
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB error:', err));

app.listen(3000, '0.0.0.0', () => {
    console.log('Server working on http://localhost:3000');
});