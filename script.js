// https://api.themoviedb.org/3/movie/top_rated?api_key=f531333d637d0c44abc85b3e74db2186&language=en-US&page=1
const moviesList = document.getElementById("movies-list");
const apiKey='a43e4b7c2c04ac787a1f267166891c95';
// const apiKey="f531333d637d0c44abc85b3e74db2186"
let currentPage=1,
totalPages=1,movies=[];


function getFavMoviesFromLocalStorage(){
  const favMovies = JSON.parse(localStorage.getItem("favouriteMovies"));
  return favMovies === null ? [] : favMovies;
}
function addMovieInfoInLocalStorage(mInfo){
const localStorageMovies =getFavMoviesFromLocalStorage();
for(let i = 0; i < localStorageMovies.length; i++){
  if(localStorageMovies[i].title === mInfo.title){
      return;
  }
}
localStorage.setItem("favouriteMovies",JSON.stringify([...localStorageMovies,mInfo]))
};

function removeFavMoviesFromLocalStorage(mInfo){
  const localStorageMovies=getFavMoviesFromLocalStorage();
  const filterMovies=localStorageMovies.filter((eMovies)=>eMovies.title!=mInfo.title)
  localStorage.setItem("favouriteMovies",JSON.stringify(filterMovies));
} 

function renderMovies(movies=[]){
moviesList.innerHTML="";
const favMovies = getFavMoviesFromLocalStorage();
const favMoviesMapping=favMovies.reduce((acc,curr)=>{
  acc[curr.title]=true;
  return acc;
},{});
console.log(favMoviesMapping);

movies.forEach((emovies)=>{
const {poster_path,title,vote_average ,vote_count}= emovies;
    let listItem = document.createElement("li");
    listItem.className="card";

    let imageUrl= poster_path ?`https://image.tmdb.org/t/p/original${poster_path}`:"";
    let mInfo={
        title,
        vote_average,
        vote_count,
        poster_path,
    };

const isFav =favMoviesMapping[title];
mInfo=JSON.stringify(mInfo);
mInfo=mInfo.replaceAll("'","")
    listItem.innerHTML=`
 <img
class="poster"
src=${imageUrl};
 alt=${title}
/>
<p class="title">${title}</p>
<section class="vote-fav">
  <section>
    <p>Votes: ${vote_count}</p>
    <p>Rating: ${vote_average}</p>
 </section>
  <i mInfo='${mInfo}' class="fa-regular fa-heart fa-2xl fav-icon ${isFav && "fa-solid"} "></i>
</section>`

const favIconBtn=listItem.querySelector('.fav-icon');

favIconBtn.addEventListener('click',(event)=>{
let mInfo=JSON.parse(event.target.getAttribute("mInfo"));
// console.log(mInfo);

if(favIconBtn.classList.contains("fa-solid")){
favIconBtn.classList.remove("fa-solid");
removeFavMoviesFromLocalStorage(mInfo);
}
else{
favIconBtn.classList.add("fa-solid");
addMovieInfoInLocalStorage(mInfo);
}
})
moviesList.appendChild(listItem);

})
}
async function fetchMovies(){
try{
const response=  await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${currentPage}`)

let data = await response.json();
movies=data.results;
console.log(data);
totalPages=data.total_pages;
tPage.innerHTML=totalPages;
renderMovies(movies);
}
catch(error){
    console.log(error);
}
}
fetchMovies();

const prevBtn = document.getElementById('prev-button');
const nextBtn =document.getElementById('next-button');
const currPage =document.getElementById('currPage');
const tPage = document.getElementById('totalPage');
prevBtn.disabled=true;

prevBtn.addEventListener('click',navigateToPrevious);
nextBtn.addEventListener('click',navigateToNext);

function navigateToPrevious(){
  currentPage--;
  currPage.innerHTML =currentPage;

  if(searchInut.value.length>0){
    searchMovies();
  }
  else{
    fetchMovies();
    
  }

  if(currentPage<=1){
    prevBtn.disabled=true;
  }
  else{
    prevBtn.disabled=false;
  }

  if(currentPage>=totalPages){
    nextBtn.disabled =true;
  }
  else{
    nextBtn.disabled=false;
  }
}

function navigateToNext(){
  currentPage++;
  currPage.innerHTML =currentPage;
  if(searchInut.value.length>0){
    searchMovies();
  }
  else{
    fetchMovies();
    
  }

  if(currentPage<=1){
    prevBtn.disabled=true;
  }
  else{
    prevBtn.disabled=false;
  }

  if(currentPage>=totalPages){
    nextBtn.disabled =true;
  }
  else{
    nextBtn.disabled=false;
  }
}

async function searchMovies(){
  const searchText = searchInut.value;
  const url = `https://api.themoviedb.org/3/search/movie?query=${searchText}&api_key=${apiKey}&language=en-US&page=${currentPage}`
  const resp = await fetch(url);
  const data = await resp.json(); 

  movies =data.results;
  totalPages =data.total_pages;
  console.log(totalPages);
  tPage.innerHTML = totalPages;

  renderMovies(movies);
}

const searchBtn = document.getElementById('search-button');
const searchInut =document.getElementById('search-input');

searchBtn.addEventListener('click',searchMovies);

let sortByDateFlag= 0;
function sortByDate(){
  if(sortByDateFlag){
    
    movies.sort((m1,m2)=>{
      return new Date(m2.release_date)-new Date(m1.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText="Sort by date (oldest to latest)";
  }
  else{
    movies.sort((m1,m2)=>{
      return new Date(m1.release_date)-new Date(m2.release_date);
    });
    renderMovies(movies);

    sortByDateFlag=!sortByDateFlag;

    sortByDateBtn.innerText="Sort by date (latest to oldest)";
  }
}


let sortByRatingFlag = 0;
function sortByRating(){
if(sortByRatingFlag){
movies.sort((m1,m2)=>{
  return m2.vote_average - m1.vote_average;
})
sortByRatingFlag=!sortByRatingFlag;
renderMovies(movies);
sortByRatings.innerText='Sort by rating(lowest to highest)';
}
else{
movies.sort((m1,m2)=>{
return m1.vote_average - m2.vote_average;
});
renderMovies(movies);

sortByRatingFlag = !sortByRatingFlag;

sortByRatings.innerText='Sort by rating(highest to lowest)';
}
}

function onSearchChange(event){
let val =event.target.value;
console.log(val);

if(val){
  searchMovies(val);
}
else{
  fetchMovies();
}
}
let timer;
function debounce(event){
clearTimeout(timer);
  timer=setTimeout(()=>{
  onSearchChange(event); 
},2000);
}

searchInut.addEventListener("input",(event)=>{
  debounce(event);
})
const sortByDateBtn =document.getElementById('sort-by-date');
sortByDateBtn.addEventListener('click',sortByDate);

const sortByRatings =document.getElementById('sort-by-rating');
sortByRatings.addEventListener('click',sortByRating);


  
  function renderFavMovies(){
    moviesList.innerHTML="";
    const favMovie=getFavMoviesFromLocalStorage();
    
    favMovie.forEach((eFavMovie)=>{
      let listItem=document.createElement('li');
      listItem.className="card";
      
      const {poster_path,title,vote_average,vote_count} = eFavMovie;
      
      const imageUrl= poster_path ? `https://image.tmdb.org/t/p/original${poster_path}` : "";
      
    let mInfo = {
      title,
      vote_count,
      vote_average,
      poster_path
    }
    mInfo =JSON.stringify(mInfo);
    listItem.innerHTML=`
    <img
    class="poster"
    src=${imageUrl};
    alt=${title}
    />
    <p class="title">${title}</p>
    <section class="vote-fav">
    <section>
    <p>Votes: ${vote_count}</p>
    <p>Rating: ${vote_average}</p>
    </section>
    <i mInfo='${mInfo}' class="fa-regular fa-heart fa-2xl fav-icon fa-solid "></i>
    </section>`
    
    const favIconBtn =listItem.querySelector(".fav-icon");
    
    favIconBtn.addEventListener("click",(event)=>{
      let mInfo=JSON.parse(event.target.getAttribute("mInfo"));
      console.log(mInfo);
      removeFavMoviesFromLocalStorage(mInfo);

      event.target.parentElement.parentElement.remove();
    });
    moviesList.appendChild(listItem);
  });
}

function displayMovies(){
  if(allTabsBtn.classList.contains('active-tab')){
    renderMovies(movies)
  }
  else{
    renderFavMovies();
  }
}

function switchTabs(event){
  allTabsBtn.classList.remove("active-tab");
  favTabsBtn.classList.remove("active-tab");
  
  event.target.classList.add("active-tab");
  
  displayMovies();
  console.log("hi")
  }

const allTabsBtn = document.getElementById('all-tab');
const favTabsBtn = document.getElementById('favorites-tab');

allTabsBtn.addEventListener('click',switchTabs);
favTabsBtn.addEventListener('click',switchTabs);