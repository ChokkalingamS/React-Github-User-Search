import { useState, useContext, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import NavigationIcon from '@mui/icons-material/Navigation';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import { context } from './App';
import './App.css';
import './Responsive.css';

export function Repository() {
  const { name } = useContext(context);
  const [repo, setRepo] = useState([]);
  const [loading, setLoading] = useState('');
  const [show, setShow] = useState('hide');
  const [currentPage, setCurrentPage] = useState(1);
  const [reposPerPage, setReposPerPage] = useState(10);
  const [err, setErr] = useState(1);
  const [filterRepo, setFilterRepo] = useState([]);

//   Pagination
  const lastRepoIndex = currentPage * reposPerPage;
  const firstRepoIndex = lastRepoIndex - reposPerPage;

  try {
    var currentRepo = repo.slice(firstRepoIndex, lastRepoIndex);
  } catch (error) {
    setErr(0);
  }

  const paginate = (pageNum) => setCurrentPage(pageNum);

//   To get repository
  useEffect(() => {
    setLoading('Loading');
    fetch(`https://api.github.com/users/${name}/repos?per_page=100`)
      .then((data) => data.json())
      .then((data) => setRepo(data))
      .then(() => setShow('show'))
      .then(() => setLoading(''));

  }, []);

//   Search Repository
  const filterData = search => {
    let result = repo.filter(x => { return x.name === search.split(' ').join('-'); });
    console.log(result);
    setFilterRepo((result.length) ? result : []);
  };

  return (<div className='repo-container'>
      {/* App Bar */}
    <Appbar filterData={filterData} />

    <div>   {/* Filter Repository */}
      {(err === 1 && show === 'show' && filterRepo.length) ? <Repo repo={filterRepo} /> : ''}
      {(err === 1 && show === 'show' && filterRepo.length) ? <Button onClick={() => setFilterRepo([])} variant='contained' id='backRepoButton'>Back to Repository</Button> : ''}
    </div>
    {/* All Repository */}
    {(err === 1 && show === 'show' && filterRepo.length === 0) ? <Repo repo={currentRepo} /> :
      (!filterRepo.length) ? <CircularProgress id='repoProgress'></CircularProgress> : ''}
    {/* Float Icon */}
    {(currentRepo.length > 5 && filterRepo.length === 0) && <Fab variant="extended" id="floaticon" onClick={() => window.scroll(-500, 0)}>
      <NavigationIcon sx={{ mr: 1 }} />Navigate</Fab>}
      {/* Pagination */}
    {(err === 1 && show === 'show' && filterRepo.length === 0) && <Page totalRepo={repo.length} paginate={paginate} reposPerPage={reposPerPage} />}

  </div>);
}

// Repository
function Repo({ repo }) 
{
    // Date Format
  const convert = (created_at) => {
    const date = new Date(created_at);
    const dateFormat = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    return dateFormat;
  };


  return (<div className='repoPage'>
    {repo.map(({ full_name, html_url, created_at, id, updated_at, language, open_issues, stargazers_count }) => {
      return (
        <Card key={id} id='repo'>
          <a href={html_url} target='_blank'>{full_name}</a><br /><br />
            {/* Repository Info */}
          <Moreinfo created_at={created_at} updated_at={updated_at} convert={convert} open_issues={open_issues}
            star={<Badge badgeContent={stargazers_count} color="primary" showZero>
              <StarIcon style={{ fill: 'gold' }} />
            </Badge>}
            // Language Icons
            language={(language) && <Icon language={language} />} />
        </Card>);
    })}
  </div>);
}


// More Info
function Moreinfo({ convert, created_at, updated_at, open_issues, star, language }) {
  const [showContent, setShowContent] = useState(0);

  return (<div>
    <div className='icons'>
      <Tooltip title='More Info'>
        <IconButton onClick={() => setShowContent((content) => (content === 1) ? 0 : 1)}><InfoIcon color='primary' /></IconButton>
      </Tooltip>
      {language}
      {star}
    </div>
    {/* Condional rendering */}
    {(showContent === 1) && <div className='content'>
      <p>Created : {convert(created_at)}</p>
      <p>Updated : {convert(updated_at)}</p>
      <p>Issues : {open_issues}</p>
    </div>}
  </div>);
}

// Pagination
function Page({ totalRepo, paginate, reposPerPage }) {

  return (
    <div id='pagination'>
      <Stack spacing={2} id='paginate'>
        <Pagination count={Math.ceil(totalRepo / reposPerPage)} size='Large' onChange={(e, value) => paginate(value)} size="large">
        </Pagination>
      </Stack>
    </div>);
}


function Appbar({ filterData }) {
  const { userData, name } = useContext(context);
  const { html_url } = userData;
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Tooltip title={name}>
            <IconButton><a href={html_url} target='_blank'><GitHubIcon style={{ fill: 'white', height: '2.3rem', width: '2.3rem' }} /></a></IconButton>
          </Tooltip>
          <div>
              {/* Search Bar */}
            <InputBase onChange={(e) => filterData(e.target.value)} placeholder="Search Repository" className='searchfield'
              inputProps={{ 'aria-label': 'search', }} />
          </div>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          </Box>
        </Toolbar>

      </AppBar>
    </Box>
  );
}

// Icons based on language
function Icon({ language }) {
  switch (language) {
    case 'HTML':
      return <i class="fab fa-html5" style={{ color: '#F06529', fontSize: '1.5rem' }}></i>;

    case 'CSS':
      return <i class="fab fa-css3-alt" style={{ color: 'skyblue', fontSize: '1.5rem' }}></i>;

    case 'JavaScript':
      return <i class="fab fa-js" style={{ color: 'orange', fontSize: '1.5rem' }}></i>;

    case 'Python':
      return <i class="fab fa-python" style={{ color: 'yellow', fontSize: '1.5rem' }}></i>;

    case 'C':
      return <i class="fab fa-cuttlefish" style={{ color: 'violet', fontSize: '1.5rem' }}></i>;

    case 'Java':
      return <i class="fab fa-java" style={{ color: 'brown', fontSize: '1.5rem' }}></i>;


    default:
      return <CodeIcon />;

  }
}
