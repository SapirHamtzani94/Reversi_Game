
function welcomeData(){
    document.getElementById("letsStart").onclick=(()=>{
      let pB=document.querySelector(" .name-input-black").value;
      let pW=document.querySelector(" .name-input-white").value;
      let size= document.querySelector(" .size").value;
      sessionStorage.setItem('pB', pB);
      sessionStorage.setItem('pW',pW);
      sessionStorage.setItem('sizeGrid',size);
      window.location="./gamePage.html";
    });
}