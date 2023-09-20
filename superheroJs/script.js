let searchBar = document.getElementById("search-bar");
let searchResults = document.getElementById("search-results");
searchBar.addEventListener("input", () => searchHeros(searchBar.value));

async function searchHeros(textSearched) {

     let PUBLIC_KEY = "e04cd2f8687bf8032fbc26e34f4580d4";
     let PRIVATE_KEY = "fda611bf8b9b1dd92b132f3d6c271b3bcd07167f";

     let ts = new Date().getTime();
     let hash = CryptoJS.MD5(ts + PRIVATE_KEY + PUBLIC_KEY).toString();
     console.log("hash: ", hash);
     
     if (textSearched.length == 0) {
          searchResults.innerHTML = ``;
          return;
     }

     // API call to get the data // nameStartsWith=${textSearched}
     await fetch(`https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=e04cd2f8687bf8032fbc26e34f4580d4&hash=${hash}`)
          .then(res => res.json()) 
          .then(data => {
            console.log("got the data:", data);
            showSearchedResults(data.data.results);
          });
}

function showSearchedResults(searchedHero) {

     // if the id exist in this array then we display "Remove from favourites" button otherwise we display "Add to favourites button"
     // favouritesCharacterIDs is a map which contains id of character as key and true as value 
     let favouritesCharacterIDs = localStorage.getItem("favouritesCharacterIDs");
     if(favouritesCharacterIDs == null){
          favouritesCharacterIDs = new Map();
     } else {
          favouritesCharacterIDs = new Map(JSON.parse(favouritesCharacterIDs));
     }

     searchResults.innerHTML = ``;
     let count = 1; // to count the result displayed in DOM

     for (const key in searchedHero) {
          // if count <= 5 then only we display it in dom other results are discarded
          if (count <= 5) {
               // getting the single hero 
               // hero is the object that we get from API
               let hero = searchedHero[key];
               // Appending the element into DOM
               searchResults.innerHTML +=
                    `
               <li class="flex-row single-search-result">
                    <div class="flex-row img-info">
                         <img src="${hero.thumbnail.path+'/portrait_medium.' + hero.thumbnail.extension}" alt="">
                         <div class="hero-info">
                              <a class="character-info" href="./superheroInfo.html">
                                   <span class="hero-name">${hero.name}</span>
                              </a>
                         </div>
                    </div>
                    <div class="flex-col buttons">
                         <!-- <button class="btn"><i class="fa-solid fa-circle-info"></i> &nbsp; More Info</button> -->
                         <button class="btn add-to-fav-btn">${favouritesCharacterIDs.has(`${hero.id}`) ? "<i class=\"fa-solid fa-heart-circle-minus\"></i> &nbsp; Remove from Favourites" :"<i class=\"fa-solid fa-heart fav-icon\"></i> &nbsp; Add to Favourites</button>"}
                    </div>
                    <div style="display:none;">
                         <span>${hero.name}</span>
                         <span>${hero.description}</span>
                         <span>${hero.comics.available}</span>
                         <span>${hero.series.available}</span>
                         <span>${hero.stories.available}</span>
                         <span>${hero.thumbnail.path+'/portrait_uncanny.' + hero.thumbnail.extension}</span>
                         <span>${hero.id}</span>
                         <span>${hero.thumbnail.path+'/landscape_incredible.' + hero.thumbnail.extension}</span>
                         <span>${hero.thumbnail.path+'/standard_fantastic.' + hero.thumbnail.extension}</span>
                    </div>
               </li>
               `
          }
          count++;
     }
     // Adding the appropritate events to the buttons after they are inserted in dom
     events();
}

// Function for attacthing eventListener to buttons
function events() {
     let favouriteButton = document.querySelectorAll(".add-to-fav-btn");
     favouriteButton.forEach((btn) => btn.addEventListener("click", addToFavourites));

     let characterInfo = document.querySelectorAll(".character-info");
     characterInfo.forEach((character) => character.addEventListener("click", addInfoInLocalStorage))
}

// Function invoked when "Add to Favourites" button or "Remvove from favourites" button is click appropriate action is taken accoring to the button clicked
function addToFavourites() {

     // If add to favourites button is cliked then
     if (this.innerHTML == '<i class="fa-solid fa-heart fav-icon"></i> &nbsp; Add to Favourites') {

          // We cretate a new object containg revelent info of hero and push it into favouritesArray
          let heroInfo = {
               name: this.parentElement.parentElement.children[2].children[0].innerHTML,
               description: this.parentElement.parentElement.children[2].children[1].innerHTML,
               comics: this.parentElement.parentElement.children[2].children[2].innerHTML,
               series: this.parentElement.parentElement.children[2].children[3].innerHTML,
               stories: this.parentElement.parentElement.children[2].children[4].innerHTML,
               portraitImage: this.parentElement.parentElement.children[2].children[5].innerHTML,
               id: this.parentElement.parentElement.children[2].children[6].innerHTML,
               landscapeImage: this.parentElement.parentElement.children[2].children[7].innerHTML,
               squareImage: this.parentElement.parentElement.children[2].children[8].innerHTML
          }

          let favouritesArray = localStorage.getItem("favouriteCharacters");

          if (favouritesArray == null) {
               favouritesArray = [];
          } else {
               favouritesArray = JSON.parse(favouritesArray);
          }

          let favouritesCharacterIDs = localStorage.getItem("favouritesCharacterIDs");

          
          if (favouritesCharacterIDs == null) {
               favouritesCharacterIDs = new Map();
          } else {
               favouritesCharacterIDs = new Map(JSON.parse(favouritesCharacterIDs));
          }

          // again setting the new favouritesCharacterIDs array to localStorage
          favouritesCharacterIDs.set(heroInfo.id, true);

          // adding the above created heroInfo object to favouritesArray
          favouritesArray.push(heroInfo);

          localStorage.setItem("favouritesCharacterIDs", JSON.stringify([...favouritesCharacterIDs]));
          localStorage.setItem("favouriteCharacters", JSON.stringify(favouritesArray));

          // Convering the "Add to Favourites" button to "Remove from Favourites"
          this.innerHTML = '<i class="fa-solid fa-heart-circle-minus"></i> &nbsp; Remove from Favourites';
          
          // Displaying the "Added to Favourites" toast to DOM
          document.querySelector(".fav-toast").setAttribute("data-visiblity","show");
          // Deleting the "Added to Favourites" toast from DOM after 1 seconds
          setTimeout(function(){
               document.querySelector(".fav-toast").setAttribute("data-visiblity","hide");
          },1000);
     }
     // For removing the character form favourites array
     else{
          
          // storing the id of character in a variable 
          let idOfCharacterToBeRemoveFromFavourites = this.parentElement.parentElement.children[2].children[6].innerHTML;
          
          let favouritesArray = JSON.parse(localStorage.getItem("favouriteCharacters"));
          
          // getting the favaourites character ids array for deleting the character id from favouritesCharacterIDs also
          let favouritesCharacterIDs = new Map(JSON.parse(localStorage.getItem("favouritesCharacterIDs")));
          
          // will contain the characters which should be present after the deletion of the character to be removed 
          let newFavouritesArray = [];
          
          // deleting the character from map using delete function where id of character acts as key
          favouritesCharacterIDs.delete(`${idOfCharacterToBeRemoveFromFavourites}`);
          
          favouritesArray.forEach((favourite) => {
               if(idOfCharacterToBeRemoveFromFavourites != favourite.id){
                    newFavouritesArray.push(favourite);
               }
          });
                    
          // Updating the new array in localStorage
          localStorage.setItem("favouriteCharacters",JSON.stringify(newFavouritesArray));
          localStorage.setItem("favouritesCharacterIDs", JSON.stringify([...favouritesCharacterIDs]));
          
          
          // Convering the "Remove from Favourites" button to "Add to Favourites" 
          this.innerHTML = '<i class="fa-solid fa-heart fav-icon"></i> &nbsp; Add to Favourites';
          
          // Displaying the "Remove from Favourites" toast to DOM
          document.querySelector(".remove-toast").setAttribute("data-visiblity","show");
          // Deleting the "Remove from Favourites" toast from DOM after 1 seconds
          setTimeout(function(){
               document.querySelector(".remove-toast").setAttribute("data-visiblity","hide");
          },1000);
          // console.log();
     }     
}

// Function which stores the info object of character for which user want to see the info 
function addInfoInLocalStorage() {

     // This function basically stores the data of character in localStorage.
     // When user clicks on the info button and when the info page is opened that page fetches the heroInfo and display the data  
     let heroInfo = {
          name: this.parentElement.parentElement.parentElement.children[2].children[0].innerHTML,
          description: this.parentElement.parentElement.parentElement.children[2].children[1].innerHTML,
          comics: this.parentElement.parentElement.parentElement.children[2].children[2].innerHTML,
          series: this.parentElement.parentElement.parentElement.children[2].children[3].innerHTML,
          stories: this.parentElement.parentElement.parentElement.children[2].children[4].innerHTML,
          portraitImage: this.parentElement.parentElement.parentElement.children[2].children[5].innerHTML,
          id: this.parentElement.parentElement.parentElement.children[2].children[6].innerHTML,
          landscapeImage: this.parentElement.parentElement.parentElement.children[2].children[7].innerHTML,
          squareImage: this.parentElement.parentElement.parentElement.children[2].children[8].innerHTML
     }

     localStorage.setItem("heroInfo", JSON.stringify(heroInfo));
}

/*-----------------------------------------------------  Theme Changing  -------------------------------------------------  */

// Selection of theme button
let themeButton = document.getElementById("theme-btn");

themeButton.addEventListener("click",themeChanger);

// IIFE fuction which checks the localStorage and applies the presviously set theme
(function (){
     let currentTheme = localStorage.getItem("theme");
     if(currentTheme == null){
          root.setAttribute("color-scheme","light");
          themeButton.innerHTML = `<i class="fa-solid fa-moon"></i>`;
          themeButton.style.backgroundColor="#0D4C92";
          localStorage.setItem("theme","light");
          return;
     }

     switch(currentTheme){
          case "light":
               root.setAttribute("color-scheme","light");
               themeButton.innerHTML = `<i class="fa-solid fa-moon"></i>`;
               themeButton.style.backgroundColor="#0D4C92";
               break;
          case "dark":
               root.setAttribute("color-scheme","dark");
               themeButton.innerHTML = `<i class="fa-solid fa-sun"></i>`;
               themeButton.style.backgroundColor="#FB2576";
               themeButton.childNodes[0].style.color = "black";
               break;
     }
})();

// function for handeling theme button changes
function themeChanger(){
     let root = document.getElementById("root");
     // let themeIcon = document.querySelector("#themeButton i");
     if(root.getAttribute("color-scheme") == "light"){
          root.setAttribute("color-scheme","dark");
          themeButton.innerHTML = `<i class="fa-solid fa-sun"></i>`;
          themeButton.style.backgroundColor="#FB2576";
          themeButton.childNodes[0].style.color = "black";
          localStorage.setItem("theme","dark");
     }
     else if(root.getAttribute("color-scheme") == "dark"){
          root.setAttribute("color-scheme","light");
          themeButton.innerHTML = `<i class="fa-solid fa-moon"></i>`;
          themeButton.style.backgroundColor="#0D4C92";
          themeButton.childNodes[0].style.color = "white";
          localStorage.setItem("theme","light");
     }
}