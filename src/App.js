import './App.css';
import{Switch,Route,useHistory} from "react-router-dom";
import {useState,createContext,useContext,useEffect} from 'react'
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import GitHubIcon from '@mui/icons-material/GitHub';
import TextField from '@mui/material/TextField';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';
import { amber,grey,blue } from '@mui/material/colors';
import Card from '@mui/material/Card';
import { InputGroup } from 'react-bootstrap';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import NavigationIcon from '@mui/icons-material/Navigation';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';

export default function App() 
{
  const getDesignTokens = (mode) => ({
    palette: {
      mode,
      // primary: {
      //   ...blue,
      //   ...(mode === 'dark' && {
      //     main: amber[300],
      //   }),
      // },
      ...(mode === 'dark' && {
        background: {
          default: '#020b1f',
          paper: '#020b1f',
        },
      }),
   
    },
  });
  const darkModeTheme = createTheme(getDesignTokens('dark'));
  return (
    <ThemeProvider theme={darkModeTheme} className='App' style={{minHeight:'100vh'}}>
         <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
     <Github/>
     </Box>
     </ThemeProvider>
  );
}
 
const context=createContext('')
function Github()
{
  let history=useHistory()
  const [userData,setUserData]=useState((localStorage.getItem('name')?localStorage.getItem('name'):''))
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

function Homepage()
{
  const {userData,setUserData,name,setName}=useContext(context)
  const [loading,setLoading]=useState('')
  const [show,setShow]=useState('hide')
  const storedName=localStorage.getItem('name')
  let [styles,setStyles]=useState({marginTop:'2rem'})

  useEffect(()=>
  (storedName)&&getProfile(storedName),[]
  )

  const getProfile=(name)=>{
    setLoading('Loading')
    fetch(`https://api.github.com/users/${name}`)
    .then((data)=>data.json())
    .then((data)=>setUserData(data))
    .then(()=>setShow('show'))
    .then(()=>setLoading(''))
    .then(()=>setStyles({marginTop:'-5rem'}))
  }

  return(<div className='homePageContainer'>
    <Tooltip title='GITHUB'>
     <IconButton><a href='https://github.com/' target='_blank'><GitHubIcon id='githubIcon'/></a></IconButton> 
     </Tooltip>
    <div className='homepage'>
    <div className='Input-field' style={styles}>
    <InputGroup className="mb-3">
    <TextField type='text' id='textfield' label="Username"  variant="outlined" onChange={(e)=>setName(e.target.value) } value={localStorage.getItem('name')}  />
    <Button onClick={()=>getProfile(name)} variant="contained" color='success'  type='submit'>Search</Button>
    </InputGroup>
    </div>
    
    {(userData.message!=='Not Found' && show==='show')?<Userprofile/>:(loading)&&<CircularProgress id='profileProgress'></CircularProgress>}
    {(userData.message==='Not Found')&&<p>User Not Found</p>}

    </div>
    </div>)
}

function Userprofile()
{
  const {userData}=useContext(context)
  const {avatar_url,bio,blog,created_at,followers,following,name,updated_at,public_repos}=userData
  let history=useHistory()

  const convert =(created_at)=>{
    const date=new Date(created_at)
    const dateFormat=`${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
    return dateFormat;
  }

  return(<Card className='profile'>
    <img src={avatar_url} alt='profile-pic' className='profile-pic'/>
    <div>
      <p>Name: {name}</p>
      {(bio!==null)&&<p>Bio: {bio}</p>}
      {(blog!=='')&&<p>Blog: {blog}</p>}
      <p>Created At: {convert(created_at)}</p>
      <p>Last Updated: {convert(updated_at)}</p>
      <p>Followers: {followers}</p>
      <p>Following: {following}</p>
      <p>Repositories: {public_repos}</p>
      <Button onClick={()=>history.push('/repo')} variant="contained" color='primary'  >Show Repositories</Button>
    </div>
  </Card>)
}


function Repository()
{
  const {name}=useContext(context);
  const [repo,setRepo]=useState([]);
  const [loading,setLoading]=useState('');
  const [show,setShow]=useState('hide')
  const [currentPage,setCurrentPage]=useState(1);
  const [reposPerPage,setReposPerPage]=useState(10);
  const [err,setErr]=useState(1);
  const [filterRepo,setFilterRepo]=useState([])

  const lastRepoIndex=currentPage*reposPerPage;
  const firstRepoIndex=lastRepoIndex-reposPerPage
  
  try {
    var currentRepo=repo.slice(firstRepoIndex,lastRepoIndex)
  } catch (error)
   {
    setErr(0)
  }
  
console.log(repo)
  const paginate=(pageNum)=>setCurrentPage(pageNum)

  useEffect(()=>{
   
    setLoading('Loading')
    fetch(`https://api.github.com/users/${name}/repos?per_page=100`)
    .then((data)=>data.json())
    .then((data)=>setRepo(data))
    .then(()=> setShow('show'))
    .then(()=>setLoading(''))

  },[])

  // let result;
  const filterData=search=>
  {
   let  result=repo.filter(x=>{ return x.name===search.split(' ').join('-')})
    console.log(result)
    setFilterRepo((result.length)?result:[])
  }  
  return(<div className='repo-container'>
      <PrimarySearchAppBar filterData={filterData}/>
      <div >
      {(err===1 && show==='show'&& filterRepo.length)?<Repo repo={filterRepo}/>:''}
      {(err===1 && show==='show'&& filterRepo.length)?<Button onClick={()=>setFilterRepo([])} variant='contained' id='backRepoButton'>Back to Repository</Button>:''}
      </div>
      {(err===1 && show==='show'&& filterRepo.length===0)?<Repo repo={currentRepo}/>:
      (!filterRepo.length)?<CircularProgress id='repoProgress'></CircularProgress>:''}

      {(currentRepo.length>5 && filterRepo.length===0)&&<Fab variant="extended" id="floaticon" onClick={()=>window.scroll(-500,0)}>
        <NavigationIcon sx={{ mr: 1 }} />Navigate</Fab>  }
      {(err===1 && show==='show'&& filterRepo.length===0)&&<Page totalRepo={repo.length} paginate={paginate} reposPerPage={reposPerPage}/>}
     
  </div>)
}



function Repo({repo})
{
  const convert =(created_at)=>{
    const date=new Date(created_at)
    const dateFormat=`${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
    return dateFormat;
  }


  return(<div className='repoPage'>
      {repo.map(({full_name,html_url,created_at,id,updated_at,language,open_issues,stargazers_count})=>{
      return(
        <Card key={id} id='repo'>
        <a href={html_url} target='_blank'>{full_name}</a><br/><br/>
       
        <Moreinfo created_at={created_at} updated_at={updated_at} convert={convert} open_issues={open_issues}
        star={<Badge badgeContent={stargazers_count} color="primary" showZero>
        <StarIcon style={{fill:'gold'}}/>
        </Badge>}
        language={(language)&&<Icon language={language}/>}
        />

        
        
        </Card>)
    })}
 </div> )  
}

function Moreinfo({convert,created_at,updated_at,open_issues,star,language})
{
  const [showContent,setShowContent]=useState(0)

  return(<div>
    <div className='icons'>
    <Tooltip title='More Info'>
    <IconButton onClick={()=>setShowContent((content)=>(content===1)?0:1)}><InfoIcon color='primary'/></IconButton>
    </Tooltip>
    {language}
    {star}
    </div >
    {(showContent===1)&&<div className='content'>
    <p>Created : {convert(created_at)}</p>
    <p>Updated : {convert(updated_at)}</p>
    <p>Issues : {open_issues}</p>
    </div>}
    </div>)
}

function Page({totalRepo,paginate,reposPerPage})
{
 
      return (
      <div id='pagination'>
      <Stack spacing={2}>
      <Pagination count={Math.ceil(totalRepo/reposPerPage)} onChange={(e,value)=>paginate(value)} size="large" >
      </Pagination>
    </Stack>
    </div>)
}

function PrimarySearchAppBar({filterData}) 
{
  const {userData,name}=useContext(context)
  const {html_url}=userData
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
          <Tooltip title={name}>
           <IconButton><a href={html_url} target='_blank'><GitHubIcon style={{fill:'white',height:'2.3rem',width:'2.3rem'}}/></a></IconButton> 
           </Tooltip>
            <div>
            <InputBase onChange={(e)=>filterData(e.target.value)}  placeholder="Search Repository" className='searchfield'
                inputProps={{ 'aria-label': 'search',}}/>
              </div>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            </Box>
          </Toolbar>
          
        </AppBar>
      </Box>
    );
  }
  



  function Icon({language})
  {
    switch (language) {
      case 'HTML':
        return <i class="fab fa-html5" style={{color:'#F06529',fontSize:'1.5rem'}}></i>
        
        case 'CSS':
        return <i class="fab fa-css3-alt" style={{color:'skyblue',fontSize:'1.5rem'}}></i>
        
        case 'JavaScript':
        return <i class="fab fa-js" style={{color:'orange',fontSize:'1.5rem'}}></i>

        case 'Python':
          return <i class="fab fa-python" style={{color:'yellow',fontSize:'1.5rem'}}></i>

        case 'C':
        return <i class="fab fa-cuttlefish" style={{color:'violet',fontSize:'1.5rem'}}></i>

        case 'Java':
          return <i class="fab fa-java" style={{color:'brown',fontSize:'1.5rem'}}></i>

        
      default:
        return <CodeIcon/>
        
    }
  }




