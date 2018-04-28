$(() => {
  // ページロード時にログインモーダルを表示
  // (あとでローカルストレージでログイン判定を実装)
  showLoginModal();

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
      .addClass('show')
      .on('click', '#login', () => {
        console.log('login buttonが押されたよ');
        // ここにログイン時のajax
        hideLoginModal();
      })
      .on('click', '#sign-up', () => {
        console.log('sign upボタンが押されたよ');
        // ここに登録時のajax
        hideLoginModal();
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
      .addClass('show')
      .on('click', '#create-memo-btn', () => {
        hideCreateTaskModal();
      });

    function hideCreateTaskModal() {
      $('#shade').remove();
      $('#create-task-modal')
        .removeClass('show')
        .addClass('hide');
    }
  }

  $('#create-memo-btn').on('click', () => {
    console.log('1111111111111111111111111');
    const todoTitle = $('#todo-title').val();
    const todoDetail = $('#todo-detail').val();
    const userId = 1;

    $.ajax({
      type:'POST',
      url: 'http://localhost:3000/api/tasks/',
      dataType: 'json',
      data: {
        todoTitle,
        todoDetail,
        userId,
      },
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  });
});
