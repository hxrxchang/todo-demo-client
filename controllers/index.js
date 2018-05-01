$(() => {
  // ページロード時の挙動
  // ローカルストレージからuserIdを取得
  // userIdがあればログイン済み、 なければ登録モーダルを表示
  let userId = localStorage.getItem('userId');

  if (!userId) {
    showLoginModal();
  } else {
    getTasks(userId);
  }

  function getTasks(userId) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/tasks',
      dataType: 'json',
      data: {
        userId
      },
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function showLoginModal() {
    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#login-modal');
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;


    $modalWin
      .before($shade)
      .css({ left: posX, top: posY })
      .removeClass('hide')
      .addClass('show');

    let userName;
    let password;

    $('#login').on('click', () => {
      userName = $('#user-name').val();
      password = $('#user-password').val();

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/users/login',
        dataType: 'json',
        data: {
          userName,
          password
        },
      })
      .then((res) => {
        console.log('成功', res);
        if (res.content.length) {
          userId = res.content[0].id;
          localStorage.setItem('userId', userId);

          hideLoginModal();
          getTasks(userId);
        } else {
          console.log('ユーザー名、パスワードが違います');
        }
      })
      .catch((err) => {
        console.log('失敗', err);
      });
    });

    $('#sign-up').on('click', () => {
      userName = $('#user-name').val();
      password = $('#user-password').val();

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/users/sign-up',
        dataType: 'json',
        data: {
          userName,
          password
        },
      })
      .then((res) => {
        console.log('成功', res);
        hideLoginModal();
      })
      .catch(() => {
        console.log('失敗');
      });
    });

    function hideLoginModal() {
      $('#shade').remove();
      $('#login-modal')
        .removeClass('show')
        .addClass('hide');
    }
  }

  // タスク作成モーダル表示
  $('#open-add-memo-modal-btn').on('click', showCreateTaskModal);

  function showCreateTaskModal(event) {
    event.preventDefault();

    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#create-task-modal');
    // windowはwindowオブジェクトのこと
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;

    $modalWin
      .before($shade)
      .css({left: posX, top: posY})
      .removeClass('hide')
      .addClass('show');

    $('#close-task-modal').on('click', () => {
      hideCreateTaskModal();
    });

    $('#create-memo-btn').on('click', () => {
      console.log('1111111111111111111111111');
      const todoTitle = $('#todo-title').val();
      const todoDetail = $('#todo-detail').val();
      const userId = 1;

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/tasks/create',
        dataType: 'json',
        data: {
          todoTitle,
          todoDetail,
          userId,
        },
      })
      .then((res) => {
        console.log(res);
        hideCreateTaskModal();
      })
      .catch((err) => {
        console.log(err);
        hideCreateTaskModal();
      });
    });

    function hideCreateTaskModal() {
      $('#shade').remove();
      $('#create-task-modal')
        .removeClass('show')
        .addClass('hide');
    }
  }
});
