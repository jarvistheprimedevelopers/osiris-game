function generateIntro(role){

  if(role.includes("student")){
    return "The night was quiet when reality fractured.";
  }

  if(role.includes("plumber")){
    return "Deep underground, the pipes screamed before the world bent.";
  }

  if(role.includes("teacher")){
    return "The classroom dissolved into static before your eyes.";
  }

  return "Your ordinary life ended when the Void opened.";
}
