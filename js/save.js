function saveGame(state){
  localStorage.setItem("osiris_save", JSON.stringify(state));
}

function loadGame(){
  const data = localStorage.getItem("osiris_save");
  return data ? JSON.parse(data) : null;
}
