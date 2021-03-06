document.addEventListener("DOMContentLoaded", main);

let todoItems = JSON.parse(localStorage.getItem("todoItems"));
if (!todoItems) {
  todoItems = [];
}

let idCounter =
  todoItems.length == 0 ? 0 : todoItems[todoItems.length - 1].id + 1;

function main() {
  bindEventHandlers();
  renderAllTodo();
}

function bindEventHandlers() {
  toDoForm.onsubmit = handleFormSubmit;
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);

  addTodo(
    formProps.title,
    formProps.description,
    formProps.date,
    formProps.time
  );
}

function handleEditFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);

  alterTodo(
    alterId,
    formProps.title,
    formProps.description,
    formProps.date,
    formProps.time
  );
}

function renderAllTodo(selectedDate = null) {
  const allExistingTodos = document.querySelectorAll(".todo-date-container");
  allExistingTodos.forEach((todo) => {
    todo.remove();
  });

  if (selectedDate == null) {
    todoItems.forEach((todo) => {
      renderTodo(todo);
    });
  } else {
    todoItems.forEach((todo) => {
      if (todo.date === selectedDate) {
        renderTodo(todo);
      }
    });
  }

  counterTodosPerDate();
}

function renderTodo(todo) {
  const list = document.querySelector(".todo-list");

  let allTodoDates = document.querySelectorAll(".todo-date");
  // due to the way we wanna render same dates under same div we wanna jump out if the date already exists cause then we've already renderd it.
  for (let i = 0; i < allTodoDates.length; i++) {
    if (allTodoDates[i].innerHTML === todo.date) {
      return;
    }
  }

  // Create the <div class = todo-date-container>
  const itemContainer = document.createElement("div");
  itemContainer.classList.add("todo-date-container");

  let allSameDateTodos = todoItems.filter((e) => e.date === todo.date);

  for (let i = 0; i < allSameDateTodos.length; i++) {
    // create div for removing easier
    const dataContainer = document.createElement("div");

    // only for the first add date.
    if (i < 1) {
      // Create the todo-date div
      const dateItem = document.createElement("div");
      dateItem.classList.add("todo-date");
      dateItem.innerHTML = allSameDateTodos[i].date;

      //Add date to big container
      dataContainer.append(dateItem);
    }
    // create all of the thingies

    //Create the Todo Container ( container in the container  :) )
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("todo-container");

    //Create TimeItem
    if (allSameDateTodos[i].todoTime != null) {
      const timeItem = document.createElement("div");
      timeItem.classList.add("todo-time");
      timeItem.innerHTML = allSameDateTodos[i].todoTime;

      detailsContainer.append(timeItem);
    }

    // Create Subcontainer ((Title + Actions))
    const detailsSubContainer = document.createElement("div");
    detailsSubContainer.classList.add("todo-subcontainer");

    //Create and Add Title
    const title = document.createElement("div");
    title.classList.add("todo-title");
    title.innerHTML = allSameDateTodos[i].title;

    detailsSubContainer.append(title);

    //Create button holder
    const actionsContainer = document.createElement("div");
    actionsContainer.classList.add("todo-actions");

    // Create and Add Buttons
    const editButton = document.createElement("i");
    editButton.classList.add("far");
    editButton.classList.add("fa-edit");
    editButton.addEventListener("click", () => editTodo(allSameDateTodos[i]));

    const doneButton = document.createElement("i");
    doneButton.classList.add("fa-solid");
    doneButton.classList.add("fa-check");
    doneButton.addEventListener("click", () => {
      if (allSameDateTodos[i].isDone) {
        allSameDateTodos[i].isDone = false;
        title.style.textDecoration = "";
      } else {
        allSameDateTodos[i].isDone = true;
        title.style.textDecoration = "line-through";
      }

      window.localStorage.setItem("todoItems", JSON.stringify(todoItems));
    });

    const removeButton = document.createElement("i");
    removeButton.classList.add("fa-regular");
    removeButton.classList.add("fa-trash-can");
    removeButton.addEventListener("click", () =>
      removeTodo(dataContainer, allSameDateTodos[i])
    );

    actionsContainer.append(editButton);
    actionsContainer.append(doneButton);
    actionsContainer.append(removeButton);

    //Add actions to subcontainer
    detailsSubContainer.append(actionsContainer);

    // Create Description
    const descriptionItem = document.createElement("div");
    descriptionItem.classList.add("todo-desc");
    descriptionItem.innerHTML = allSameDateTodos[i].description;

    // Add Desc and subcontainer
    detailsContainer.append(detailsSubContainer);
    detailsContainer.append(descriptionItem);

    dataContainer.append(detailsContainer);
    dataContainer.addEventListener("click", (e) =>
      ToggleTodoDescription(descriptionItem, e)
    );

    itemContainer.append(dataContainer);

    if (!allSameDateTodos[i].isDone) title.style.textDecoration = "";
    else title.style.textDecoration = "line-through";
  }

  list.append(itemContainer);
}

function removeTodo(itemContainer, todo) {
  itemContainer.parentNode.removeChild(itemContainer);
  let todoIndex = todoItems.indexOf(todo);
  todoItems.splice(todoIndex, 1);
  window.localStorage.setItem("todoItems", JSON.stringify(todoItems));

  counterTodosPerDate();
  renderAllTodo(selectedDayId);
}

function addTodo(title, description, date = selectedDayId, todoTime) {
  const todo = {
    title,
    description,
    id: idCounter,
    date,
    todoTime,
    isDone: false,
  };
  idCounter++;
  todoItems.push(todo);

  sortTodoList();
  window.localStorage.setItem("todoItems", JSON.stringify(todoItems));
  renderAllTodo(selectedDayId);

  closeForm();
}

function alterTodo(id, title, description, date, todoTime) {
  const itemToChange = todoItems.find((x) => x.id === id);

  itemToChange.title = title;
  itemToChange.description = description;
  itemToChange.date = date;
  itemToChange.todoTime = todoTime;

  sortTodoList();
  window.localStorage.setItem("todoItems", JSON.stringify(todoItems));
  renderAllTodo(selectedDayId);

  closeForm();
}

function editTodo(todo) {
  openForm(todo);
}

// i swear prettier is ruining this readability.
function sortTodoList() {
  todoItems.sort((a, b) =>
    a.date > b.date
      ? 1
      : a.date === b.date
      ? a.todoTime > b.todoTime
        ? 1
        : -1
      : -1
  );
}

function ToggleTodoDescription(obj, e) {
  // check if it's already extended.
  if (obj.classList.contains("extended")) {
    //Check if the event was target @the desc div or just the whole container
    if (e.target.classList.contains("extended")) {
      return;
    }
    obj.classList.remove("extended");
  } else {
    //close all existing extended.
    const allDesc = document.getElementsByClassName("todo-desc");

    for (let i = 0; i < allDesc.length; i++)
      allDesc[i].classList.remove("extended");

    //Then add extended to correct.
    obj.classList.add("extended");
  }
}
