class CreateElement {
  constructor(tagName, className) {
    this._elem = document.createElement(tagName);
    this._elem.classList.add(className);
  }

  setAttr(type, value) {
    this._elem.setAttribute(type, value);
    return this;
  }
  getElem() {
    return this._elem
  }
}


class CurrencyConverter {
  //конвертор рахує курс валют по  USD,EUR,RUB, конвертація одніє. валюти здійснюється в іншу через транзит в гривнях 
  constructor(selector) {
    this._selector = document.querySelectorAll(selector)[0];
    this._converter = new CreateElement("div", "converter").getElem();
    this.arr;

  }
  _createConverter() {
    const url = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";//отримуємо json Ощадбанка
    fetch(url)
      .then((response) => {
        return response.json();
      }).then((response) => {
        let resultArray = [{ rate: "", cc: "UAH" }];//в JSON нема гривні
        response.forEach((item) => {
          if (item.cc == "RUB" || item.cc == "USD" || item.cc == "EUR") { //обираємо потрібну валюту
            resultArray.push(item);
          }
        });
        console.log(resultArray);
        return resultArray;
      }).then((resultArray) => {
        this.arr = resultArray;
        resultArray.forEach((item) => {
          //створюємо розмітку для json
          this._createOption(item.cc)
        });
        return resultArray;
      }).then((resultArray) => {
        for (let i = 1; i < resultArray.length; i++) {
          this._createTargetCurrencyContainer();
          this._createTargetShowValue();
          this._createCurrencyType(resultArray[i].cc);
          this._createCurrencyRate(resultArray[i].rate);
        }
      })
  }
  //тут знаходяться внутрішні методи потрібні для роботи конвретора
  _createCurrentCurrencyContainer = () => {
    this._CurrentCurrencyContainer = new CreateElement("div", "current-currency-container").getElem();
    this._converter.appendChild(this._CurrentCurrencyContainer);
  }
  _createInputCurrentCurrency = () => {
    this._inputCurrentCurrency = new CreateElement("input", "current-currency-container__input-value").setAttr("type", "number").getElem();
    this._CurrentCurrencyContainer.appendChild(this._inputCurrentCurrency);
  }
  _createSelectCurrency = () => {
    this._selectCurrency = new CreateElement("select", "current-currency-container__select-currency").getElem();
    this._CurrentCurrencyContainer.appendChild(this._selectCurrency);
  }
  _createOption = (value) => {
    let option = new CreateElement("option", "select-currency__currency-type").getElem();
    option.textContent = value;
    this._selectCurrency.appendChild(option);
  }
  _createTargetCurrencyContainer = () => {
    this._targetCurrencycontainer = new CreateElement("div", "target-currency-container").getElem();
    this._converter.appendChild(this._targetCurrencycontainer);
  }
  _createTargetShowValue = () => {
    let targetValue = new CreateElement("input", "target-currency-container__show-value").setAttr("type", "number").setAttr("readonly", true).getElem();
    this._targetCurrencycontainer.appendChild(targetValue);
  }
  _createCurrencyType = (value) => {
    let currencyType = new CreateElement("span", "target-currency-container__currency-type").getElem();
    currencyType.textContent = value;
    this._targetCurrencycontainer.appendChild(currencyType);
  }
  _createCurrencyRate = (value) => {
    let rateValue = new CreateElement("input", "target-currency-container__rate-value").setAttr("type", "number").setAttr("readonly", true).getElem();
    rateValue.value = value.toFixed(2);
    this._targetCurrencycontainer.appendChild(rateValue);
  }
  //створюємо обраховувач події
  setEventInputValue = () => {
    window.addEventListener("keyup", (e) => {  
      let showValues = this._converter.querySelectorAll(".target-currency-container__show-value");
      let rateValues = this._converter.querySelectorAll(".target-currency-container__rate-value");
      if (e.target.classList.contains("current-currency-container__input-value") && this._selectCurrency.options.selectedIndex == 0) {//рахуємо результат для кожної валюти якщо вибрані гривні
        for (let i = 0; i < showValues.length; i++) {
          showValues[i].value = (+e.target.value / rateValues[i].value).toFixed(2);
        }
      } else if(e.target.classList.contains("current-currency-container__input-value") && this._selectCurrency.options.selectedIndex != 0){
        //рахуємо рез при виборі іншої валюти
        showValues[0].value = e.target.value * rateValues[0].value;
        //Проводимо транзитну конвертацію в гривні для інших типів валюти
        for (let i = 1; i < showValues.length; i++) {
          showValues[i].value = (+e.target.value / rateValues[i].value * rateValues[0].value).toFixed(2);
        }
      }
    })
  }
  setEventChangeSelect = () => {
    window.addEventListener("change", (e) => {
      //при выборі валюти в select змінємо значення в всіх полях з курсом ТА типом валюти
      if (e.target.classList.contains("current-currency-container__select-currency")) {
        let currencyType = this._converter.querySelectorAll(".target-currency-container__currency-type");
        let currencyRate = this._converter.querySelectorAll(".target-currency-container__rate-value");
        let spliceElem = this.arr.splice(this._selectCurrency.options.selectedIndex, 1)[0];//обарний в select елмент вирізаємл
        for (let i = 0; i < this.arr.length; i++) { //з масива перепишемо дані в currencyType и currencyRate
          currencyType[i].textContent = this.arr[i].cc;
          currencyRate[i].value = (+this.arr[i].rate).toFixed(2);
        }
        this.arr.splice(this._selectCurrency.options.selectedIndex, 0, spliceElem);//повернемо вирізаний елемент

        if (this._selectCurrency.options.selectedIndex != 0) {//при зміні select на іншу валюту ОКРІМ гривні записуємо її курс в поле з UAH
          currencyRate[0].value = this.arr[this._selectCurrency.options.selectedIndex].rate.toFixed(2);
        }
      }
    });
  }
  setEvents() {
    this.setEventInputValue();
    this.setEventChangeSelect();
  }
  render = () => {
    this._createCurrentCurrencyContainer();
    this._createInputCurrentCurrency();
    this._createSelectCurrency();
    this._createConverter();
    this._selector.appendChild(this._converter);
    this.setEvents()
  }
}
