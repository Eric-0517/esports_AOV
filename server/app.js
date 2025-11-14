
const express=require('express');
const path=require('path');
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const authRoutes=require('./routes/auth');
const teamRoutes=require('./routes/teams');
const adminRoutes=require('./routes/admin');

dotenv.config();
const app=express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("MongoDB connected"))
.catch(e=>console.error(e));

app.use(express.static(path.join(__dirname,'../public')));

app.use('/auth',authRoutes);
app.use('/api/teams',teamRoutes);
app.use('/api/admin',adminRoutes);

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('Server running on port',PORT));
