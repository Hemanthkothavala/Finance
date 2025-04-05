const express = require("express");
const app = express();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
<<<<<<< HEAD
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./key.json');
const session = require("express-session");
const { spawn } = require('child_process');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();
const auth = getAuth();
=======
const serviceAccount = require('./key.json');
const session = require("express-session");
const { errors } = require("node-telegram-bot-api/src/telegram");


initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
>>>>>>> origin/main

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(express.urlencoded({ extended: true }));
<<<<<<< HEAD
app.use(express.json());
=======

>>>>>>> origin/main
app.use(session({
  secret: "hello",
  resave: false,
  saveUninitialized: true
}));

function isAuthenticated(req, res, next) {
  if (req.session.userdata) {
    return next();
  } else {
    res.redirect("/login");
  }
}

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

<<<<<<< HEAD
// ---------- DATA SUBMISSION & MODEL TRAINING ----------
app.post("/datasubmit", isAuthenticated, (req, res) => {
  const userId = req.session.userdata.id;
  const { em, im, edum, emim, loanm, savem, inm, othm, ltgm, stgm, taxm } = req.body;

  db.collection("mldata")
    .add({
      userId,
      em: parseFloat(em),
      im: parseFloat(im),
      edum: parseFloat(edum),
      emim: parseFloat(emim),
      loanm: parseFloat(loanm),
      savem: parseFloat(savem),
      inm: parseFloat(inm),
      othm: parseFloat(othm),
      ltgm: parseFloat(ltgm),
      stgm: parseFloat(stgm),
      taxm: parseFloat(taxm),
    })
    .then(() => {
      const pythonProcess = spawn('python', ['train_model.py']);

      pythonProcess.stdout.on('data', (data) => {
        console.log(`Training Output: ${data}`);
      });
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Training Error: ${data}`);
      });
      pythonProcess.on('close', (code) => {
        console.log(`Training process exited with code ${code}`);
        res.render("model", { successMessage: "Data submitted and Model Trained!" });
      });
    })
    .catch((err) => {
      console.error("Data submission error:", err);
      res.status(500).send("Error submitting data");
    });
});

// ---------- PREDICTION ----------
app.post("/predictValues", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userdata.id;
    const snapshot = await db.collection("mldata").where("userId", "==", userId).get();

    if (snapshot.empty) {
      return res.status(400).json({ error: "No data available for prediction" });
    }

    const latestDoc = snapshot.docs[snapshot.docs.length - 1].data();
    const inputValues = [
      latestDoc.em, latestDoc.im, latestDoc.edum, latestDoc.emim, latestDoc.loanm,
      latestDoc.inm, latestDoc.othm, latestDoc.ltgm, latestDoc.stgm, latestDoc.taxm
    ];

    const pythonProcess = spawn('python', ['predict_model.py', ...inputValues.map(String)]);
    let predictionOutput = "";

    pythonProcess.stdout.on('data', (data) => {
      predictionOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Prediction Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      try {
        const predictedValues = JSON.parse(predictionOutput.replace(/'/g, '"').trim());
        res.json({ predictedValues });
      } catch (err) {
        console.error('Prediction Parsing Error:', err);
        res.status(500).json({ error: 'Prediction output parsing failed.' });
      }
    });

  } catch (error) {
    console.error('Prediction request error:', error);
    res.status(500).json({ error: 'Prediction failed.' });
  }
});

// ---------- USER AUTHENTICATION ----------

// ✅ Updated Registration using Firebase Auth
app.post("/registersubmit", (req, res) => {
  const { name, email, password, age, annualIncome, maritalStatus, numChildren } = req.body;

  db.collection("users")
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (!docs.empty) {
        res.render("registration", { errorMessage: "Email already in use" });
      } else if (password.length < 8) {
        res.render("registration", { errorMessage: "Password must contain at least 8 characters" });
      } else {
        auth.createUser({ email, password })
          .then((userRecord) => {
            const uid = userRecord.uid;
            return db.collection("users").doc(uid).set({
              name,
              email,
              age,
              annualIncome,
              maritalStatus,
              numChildren
            });
          })
          .then(() => res.redirect("/login"))
          .catch((error) => {
            console.error("Error creating user:", error);
            res.render("registration", { errorMessage: error.message });
=======
app.post("/registersubmit", (req, res) => {
  db.collection("users")
    .where("email", "==", req.body.email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.render("registration",{errorMessage:"Email already in use"});
      } else {
        db.collection("users")
          .where("name", "==", req.body.name)
          .get()
          .then((docs) => {
            if (docs.size > 0) {
              res.render("registration",{errorMessage:"Username already in use"});
            } else {
              if(req.body.password.length>=8){
                db.collection("users")
                .add({
                  age: req.body.age,
                  annualIncome: req.body.annualIncome,
                  email: req.body.email,
                  maritalStatus: req.body.maritalStatus,
                  name: req.body.name,
                  numChildren: req.body.numChildren,
                  password: req.body.password
                })
                .then(() => {
                  res.redirect("/login");
                });
              }
              else{
                res.render("registration",{errorMessage:"Password must contain atleast 8 characters"});
              }
              
            }
>>>>>>> origin/main
          });
      }
    });
});

<<<<<<< HEAD
// 🔐 Login logic (basic, still uses Firestore password check — optional to improve)
app.post("/loginsubmit", (req, res) => {
  const idToken = req.body.idToken;

  if (!idToken) {
    return res.redirect("/login"); // or res.status(400).send("No token provided");
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const uid = decodedToken.uid;

      // Optionally store user info in session
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.data();
      req.session.userdata = { id: uid, ...userData };

      res.redirect("/home");
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      res.redirect("/login"); // Redirect back to login if token invalid
    });
});


// ---------- PAGES ----------
app.get("/login", (req, res) => res.render("login"));
app.get("/registration", (req, res) => res.render("registration"));
app.get("/about", isAuthenticated, (req, res) => res.render("about"));
app.get("/home", isAuthenticated, (req, res) => res.render("home", {
  name1: req.session.userdata.name,
  annualIncome: req.session.userdata.annualIncome
}));
app.get("/contact", isAuthenticated, (req, res) => res.render("contact"));
app.get("/predict", isAuthenticated, (req, res) => res.render("predict"));
app.get("/tax", isAuthenticated, (req, res) => res.render("tax"));
app.get("/finance", isAuthenticated, (req, res) => res.render("finance"));
app.get("/trading", isAuthenticated, (req, res) => res.render("trading"));
app.get("/settings", isAuthenticated, (req, res) => res.render("settings"));
app.get("/mlsub", isAuthenticated, (req, res) => res.render("mlsub"));

app.get("/financedata", isAuthenticated, (req, res) => {
  const userId = req.session.userdata.id;
  db.collection("mldata")
    .where("userId", "==", userId)
    .get()
    .then((snapshot) => {
      const financeData = snapshot.docs.map((doc) => doc.data());
      res.render("financedata", { financeData });
    });
});

app.get("/model", isAuthenticated, (req, res) => {
  const userId = req.session.userdata.id;
  db.collection("mldata")
    .where("userId", "==", userId)
    .get()
    .then((snapshot) => {
      const financeData = snapshot.docs.map((doc) => doc.data());
      res.render("model", { financeData });
    });
});

app.get("/profile", isAuthenticated, (req, res) => {
  const { name, annualIncome, age, maritalStatus, numChildren, email } = req.session.userdata;
  res.render("profile", { username: name, annualIncome, age, maritalStatus, numChildren, email });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
=======
app.post("/loginsubmit", (req, res) => {
  db.collection("users")
    .where("email", "==", req.body.Email)
    .where("password", "==", req.body.password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        const userdata = docs.docs[0].data();
        const userId=docs.docs[0].id;
        req.session.userdata = {
          id:userId,
          name: userdata.name,
          annualIncome: userdata.annualIncome,
          age: userdata.age,
          maritalStatus: userdata.maritalStatus,
          numChildren: userdata.numChildren,
          email: userdata.email,
          password:userdata.password
        };
        res.redirect("/home");
      } else {
        res.render("login", { errorMessage: "Incorrect Email or password" });
        
      }
    });
});



app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/registration", (req, res) => {
  res.render("registration");
});

app.get("/about", isAuthenticated, (req, res) => {
  res.render("about");
});

app.get("/home", isAuthenticated, (req, res) => {
  const { name, annualIncome } = req.session.userdata;
  res.render("home", { name1: name, annualIncome });
});

app.get("/contact", isAuthenticated, (req, res) => {
  res.render("contact");
});
app.get("/tax",isAuthenticated,(req,res)=>{
  res.render("tax");
});
app.get("/finance",isAuthenticated,(req,res)=>{
  res.render("finance");
});
app.get("/trading",(req,res)=>{
  res.render("trading");
});

app.get("/settings", isAuthenticated, (req, res) => {
  res.render("settings");
});

app.post("/updateUserInfo", isAuthenticated, (req, res) => {
  const { name, email, age} = req.body;
  const userId=req.session.userdata.id;
  db.collection("users").where("email","==",req.session.userdata.email).get()
  .then((docs)=>{
    if(docs.size>0 && docs.docs[0]==userId){
      res.render("settings", {errorMessage:"Email already exist"});
    }
    else{
      db.collection("users")
    .doc(userId)
    .update({
      name: name,
      email: email,
      age: parseInt(age),
    })
    .then(() => {
      req.session.userdata = { ...req.session.userdata, name, email, age, };

      res.redirect("/profile");
    })
    
    .catch((error) => {
      console.error("Error updating user information: ", error);
      res.status(500).send("Error updating user information.");
    });
    }
  })
});
app.post("/changePassword", isAuthenticated, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.userdata.id;
  
  if (currentPassword === req.session.userdata.password) {
    if (newPassword === confirmPassword) {
      db.collection('users').doc(userId).update({ password: newPassword })
        .then(() => {
          req.session.userdata.password = newPassword;
          res.redirect("/profile");
        })
        
    } 
  } 
});



app.get("/profile", isAuthenticated, (req, res) => {
  const { name, annualIncome, age, maritalStatus, numChildren, email } = req.session.userdata;
  res.render("profile", {
    username: name,
    annualIncome,
    age,
    maritalStatus,
    numChildren,
    email
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.redirect("/home");
    } else {
      res.redirect("/login");
    }
  });
>>>>>>> origin/main
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
<<<<<<< HEAD
});
=======
});
>>>>>>> origin/main
