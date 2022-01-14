import './App.css';
import './Responsive.css';
import{Switch,Route,useHistory} from "react-router-dom";
import {useState,createContext,useContext,useEffect} from 'react'
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ThemeProvider,createTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment} from '@mui/material';
import { Repository } from './Repository';



export default function App() 
{
  const getDesignTokens = (mode) => ({
    palette: {
      mode,
      ...(mode === 'dark' && {
        background: {
          default: '#020b1f',
          paper: '#020b1f',
        },
      }),
   
    },
  });
  const darkModeTheme = createTheme(getDesignTokens('dark'));
  // Theme
  return (
    <ThemeProvider theme={darkModeTheme} >
         <Box sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
      }}>
     <Github/>
     </Box>
     </ThemeProvider>
  );
}
 
export const context=createContext('')

// Route
function Github()
{
  let history=useHistory()
  const [userData,setUserData]=useState('')
  const [name,setName]=useState('')
  localStorage.setItem('name',name)
  let obj={userData,setUserData,name,setName}
  return(
  <div>
      <context.Provider value={obj}>
      <Switch>
        {(name!==''&&userData!=='')?<Route path='/repo'><Repository/></Route>:history.push('/')}
        <Route exact path='/'><Homepage /></Route>
      </Switch>
      </context.Provider>
  </div>)
}


// HomePage
function Homepage()
{
  const {userData,setUserData,name,setName}=useContext(context)
  
  const [loading,setLoading]=useState('')
  const [show,setShow]=useState('hide')
  const storedName=localStorage.getItem('name')
  let [styles,setStyles]=useState({marginTop:'2rem'})
  
  

  // Get User Data 
  const getProfile=(name)=>{
    setLoading('Loading')
    fetch(`https://api.github.com/users/${name}`)
    .then((data)=>data.json())
    .then((data)=>setUserData(data))
    .then(()=>setShow('show'))
    .then(()=>setLoading(''))
    .then(()=>setStyles({marginTop:'-3rem'}))
  }
  
  
  // To avoid homepage data deletion 
  useEffect(()=>
  (storedName)&&getProfile(storedName),[]
  )

  return(<div className='homePageContainer'>
    <Tooltip title='GITHUB'>
     <IconButton><a href='https://github.com/' rel="noreferrer" target='_blank'><GitHubIcon id='githubIcon'/></a></IconButton> 
     </Tooltip>
    <div className='homepage'>
    <div className='Input-field' style={styles}>
    
    <TextField type='text' id='textfield' label="Username"  variant="outlined" onChange={(e)=>setName(e.target.value) } value={localStorage.getItem('name')} 
      InputProps={{
        endAdornment: (<InputAdornment position="start">
          <Tooltip title='Search'>
            <IconButton onClick={() =>(name)&&getProfile(name.split(' ').join(''))} fontSize='large'>
            <SearchIcon/>
            </IconButton>
          </Tooltip>
        </InputAdornment>
        ),
      }} />
   
    </div>
    {/* Progressbar */}
    {(userData.message!=='Not Found' && show==='show')?<Userprofile/>:(loading)&&<CircularProgress id='profileProgress'></CircularProgress>}
    {(name&&userData.message==='Not Found')&&<p>User Not Found</p>}

    </div>
    </div>)
}

function Userprofile()
{
  const {userData}=useContext(context)
  const {avatar_url,bio,blog,created_at,followers,following,name,updated_at,public_repos}=userData
  let history=useHistory()

  // Date Format
  const convert =(created_at)=>{
    const date=new Date(created_at)
    const dateFormat=`${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
    return dateFormat;
  }

  return(
     <Card className='profile'>
     <img src={avatar_url} alt='profile-pic' className='profile-pic'/>
    <div>
      <p>Name: {name}</p>
      {(bio!==null)&&<p>Bio: {bio}</p>}
      {(blog!=='')&&<p>Blog: {blog}</p>}
      <p>Created: {convert(created_at)}</p>
      <p>Updated: {convert(updated_at)}</p>
      <p>Followers: {followers}</p>
      <p>Following: {following}</p>
      <p>Repositories: {public_repos}</p>
      <Button onClick={()=>history.push('/repo')} variant="contained" color='primary' id='showrep' >Show Repositories</Button>
    </div>
  </Card>)
}



