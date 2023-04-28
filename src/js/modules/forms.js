import {modalShow, modalHide} from './modal';
import {postData} from '../services/services';


function forms() {
  const formTags = document.querySelectorAll('form'); // формы на странице
  const modalBlock = document.querySelector('.modal'); // изначально в html стоит класс .hide

  const formInputs = document.querySelectorAll('form input'); // все input в формах

  formInputs.forEach((input) => { // проверяет при вводе
    const errorElem = input.nextElementSibling; // следующий соседний с input элемент это span с ошибкой
    input.addEventListener('input', (event) => {
      errorElem.textContent = ''; // сбросить содержимое сообщения
      errorElem.className = 'error'; // сбросить визуальное состояние сообщения
      if (!event.target.validity.valid) {
        errorText(event.target, errorElem); // получить содержимое сообщения
        errorElem.className = 'error_active'; // показать сообщение с ошибкой
      }
    });
  });

  function errorText(inputElem, errorElem) { // текст сообщения в зависимости от ошибки
    if (inputElem.validity.valueMissing) {
      errorElem.textContent = 'Заполните поле';
    } else if (inputElem.validity.tooShort) {
      errorElem.textContent = `Имя должно быть не короче ${inputElem.minLength} символов`;
    } else if (inputElem.validity.patternMismatch && inputElem.matches('[type="phone"]')) {
      // для email можно создать такое же условие для type="email" с другим сообщением
      errorElem.textContent = 'Введите номер телефона';
    }
  }

  formTags.forEach((item) => { // На каждую форму вешает обработчик формы
    bindPostData(item);
  });

  function bindPostData(form) {
    form.addEventListener('submit', (event) => { // Событие отправка формы кликом на кнопку или enter
      event.preventDefault();

      const spinner = document.createElement('img'); // К форме добавляется спиннер загрузки
      spinner.setAttribute('src', 'img/form/spinner.svg');
      spinner.style.cssText = `
        display: block;
        margin: 0 auto;
      `;
      form.insertAdjacentElement('afterend', spinner); // При загрузке показывает спиннер после формы

      const formData = new FormData(form); // Данные из формы, во всех input обязательно должны быть аттрибуты name=""

      const json = JSON.stringify(Object.fromEntries(formData.entries()));
      // Данные из формы превращает в массив массивов, его в обычный объект, а его в JSON

      postData('http://localhost:3000/requests', json) // Настраивает и посылает запрос на сервер
        .then((data) => { // Обработка успешного promise
          console.log(data); // Ответ от сервера
          showThanksModal('Спасибо! Скоро мы с вами свяжемся');
          spinner.remove(); // Удаляет спиннер загрузки
        })
        .catch(() => { // Обработка reject (ошибки)
          showThanksModal('Что-то пошло не так...');
        })
        .finally(() => { // Выполнится в любом случае
          form.reset(); // Очистка формы
        });
    });
  }

  function showThanksModal(text) { // Меняет модальное окно на сообщение об отправке
    const formModalDialog = document.querySelector('.modal__dialog');

    formModalDialog.classList.add('hide'); // Скрывает внутреннюю часть старого окна
    modalShow('.modal'); // Показывает модальное окно с пустой внутренней частью

    const thanksModalDialog = document.createElement('div'); // Создает внутреннюю часть с текстом text
    thanksModalDialog.classList.add('modal__dialog');
    thanksModalDialog.innerHTML = `
    <div class="modal__content">
      <div data-close class="modal__close">&times;</div>
      <div class="modal__title">${text}</div>
    </div>
    `;
    modalBlock.append(thanksModalDialog); // Вставляет новую внутреннюю часть в модальное окно
    setTimeout(() => { // Через 4с скрывает окно и возвращает внутреннюю часть с формой
      thanksModalDialog.remove();
      formModalDialog.classList.remove('hide');
      formModalDialog.classList.add('show');
      modalHide('.modal');
    }, 4000);
  }
}

export default forms;