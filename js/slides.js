
let index = 0;
let slides = document.getElementsByClassName("slides");


slides[index].style.display = "block";


function moveSlides(step) {
  slides[index].style.display = "none";
  index += step;
  if (index > slides.length-1) {index = 0}
  else if (index < 0) {index = slides.length-1} 
  slides[index].style.display = "block";

  if(index === 1){
    map.updateSize();
  }

} 

