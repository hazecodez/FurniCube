
//============= EDIT CATEGORY VALIDATION==================
document.getElementById('editCate').addEventListener('click', function(event){
    
    const name = document.getElementById('name').value;
    
    const nameError = document.getElementById('nameError')
  
    if(name.trim() == ""){
      nameError.style.display = ""
      nameError.textContent = "Category name is required."
      event.preventDefault()
    }
  
  })
  
  