const searchField = document.querySelector(".search");
const sForm = document.querySelector(".search-form");
const hintsList = document.querySelector(".hints");
const resultsList = document.querySelector(".results");
let resultsArr = [];

const requestData = (q) => {
  const requestURL = `https://api.github.com/search/repositories?q=${q.replaceAll(
    /[\s]+/g,
    "+"
  )}&per_page=5`;
  console.log(requestURL);

  fetch(requestURL)
    .then((response) => response.json())
    .then((data) => {
      renderData(data.items);
    })
    .catch((error) => console.log(error));
};

function debounce(fn, delay) {
  let inDebounce;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => fn.apply(context, args), delay);
  };
}

const debRequest = debounce(requestData, 300);

const renderData = (items) => {
  const hints = [];
  resultsArr = [];
  items.forEach((item) => {
    let [hint, result] = parseItem(item);
    hints.push(hint);
    resultsArr.push(result);
  });
  renderHints(hints);
};

const renderHints = (hints) => {
  clearList(hintsList);
  let ord = 0;
  let fragment = new DocumentFragment();
  for (let h of hints) {
    let li = document.createElement("li");
    li.classList.add("hints__item");
    li.dataset.ord = ord++;
    li.append(h);
    fragment.append(li);
  }
  hintsList.append(fragment);
};

const renderResult = (r) => {
  let fragment = new DocumentFragment();
  let li = document.createElement("li");
  li.classList.add("results__item");
  li.insertAdjacentHTML(
    "afterbegin",
    `<ul><li><a href="${r.html_url}"><span>Name:</span> ${r.name}</a></li>
    <li><span>Owner:</span> ${r.owner}</li><li><span>Stars:</span> ${r.stars}</li></ul>`
  );
  li.insertAdjacentHTML(
    "beforeend",
    `<button type="button" class="x" tabindex="1" />`
  );
  fragment.append(li);
  resultsList.append(fragment);
  resultsArr = [];
};

const parseItem = (item) => {
  let { full_name, html_url, stargazers_count: stars } = item;
  let [owner, name] = full_name.split("/");
  return [name, { name, owner, html_url, stars }];
};

searchField.addEventListener("input", function () {
  if (this.value === "") {
    clearList(hintsList);
    resultsArr = [];
  } else {
    debRequest(this.value);
  }
});

searchField.addEventListener("keyup", function (evt) {
  if (evt.keyCode === "13") {
  }
});

sForm.addEventListener("submit", function (evt) {
  evt.preventDefault();
});

resultsList.addEventListener("click", function (evt) {
  let hit = evt.target;
  if (hit.tagName === "BUTTON") {
    const resultsItem = hit.closest(".results__item");
    resultsItem.closest(".results").removeChild(resultsItem);
  }
});

hintsList.addEventListener("click", function (evt) {
  let hit = evt.target;
  if (hit.tagName === "LI") {
    searchField.value = "";
    let ord = hit.dataset.ord;
    renderResult(resultsArr[ord]);
    clearList(hintsList);
  }
});

const clearList = (list) => {
  while (list.firstChild) list.removeChild(list.firstChild);
};
