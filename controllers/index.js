$(() => {
  // ページロード時の挙動
  // ローカルストレージからuserIdを取得
  // userIdがあればログイン済み、 なければ登録モーダルを表示
  let userId = localStorage.getItem('userId');

  if (!userId) {
    showLoginModal();
  } else {
    getTasks({userId});
  }

  function getTasks(argumentObj) {
    let userId = argumentObj.userId;
    let requestCompletedTask = argumentObj.requestCompletedTask;
    let requestDeletedTask = argumentObj.requestDeletedTask;
    let data = {
      userId
    };

    if (requestCompletedTask) data.requestCompletedTask = requestCompletedTask;
    if (requestDeletedTask) data.requestDeletedTask = requestDeletedTask;

    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/tasks',
      dataType: 'json',
      data
    })
    .then((res) => {
      let taskList = res.content;
      taskList.forEach((task) => {
        let taskId = task.id;
        let taskTitle = task.title;
        let taskDescription = task.description;

        let $taskItemDom = $('<div class="task-item">');
        let $taskTitleDom = $('<span class="task-title">');
        $taskTitleDom.text(taskTitle);
        $taskItemDom.append($taskTitleDom);

        let $taskDescriptionDom = $('<span class="task-description">')
        $taskDescriptionDom.text(taskDescription);
        $taskItemDom.append($taskDescriptionDom);

        let $editBtnDom = $('<button class="edit-task-btn">');
        $editBtnDom.text('編集');
        $editBtnDom.on('click', () => {
        });
        $taskItemDom.append($editBtnDom);

        let $completeBtnDom = $('<button class="complete-task-btn">');
        $completeBtnDom.text('完了');
        $completeBtnDom.on('click', () => {
          $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/api/tasks/complete',
            dataType: 'json',
            data: {
              taskId,
            },
          });
        });
        $taskItemDom.append($completeBtnDom);

        let $deleteBtnDom = $('<button class="delete-task-btn">');
        $($deleteBtnDom).text('削除');
        $deleteBtnDom.on('click', () => {
          showConfirmDeleteTaskModal(taskId);
        });
        $taskItemDom.append($deleteBtnDom);

        if (requestCompletedTask) {
          $('#completed-task-list').append($taskItemDom);
        } else {
          $('#not-completed-task-list').append($taskItemDom);
        }
      });
    })
    .catch((err) => {
      alert('サーバーが応答しません');
    });
  }

  function showConfirmDeleteTaskModal(taskId) {
    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#confirm-delete-task-modal');
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;


    $modalWin
      .before($shade)
      .css({ left: posX, top: posY })
      .removeClass('hide')
      .addClass('show');

    $('#delete-task-button').on('click', () => {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/tasks/delete',
        dataType: 'json',
        data: {
          taskId,
        },
      })
      .then(() => {
        hideConfirmDeleteTaskModal();
      })
      .catch(() => {
        alert('通信に失敗しました');
      });
    });

    $('#not-delete-task-button').on('click', () => {
      hideConfirmDeleteTaskModal();
    });

    function hideConfirmDeleteTaskModal() {
      $('#shade').remove();
      $('#confirm-delete-task-modal')
        .removeClass('show')
        .addClass('hide');
    }
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
        if (res.content.length) {
          userId = res.content[0].id;
          localStorage.setItem('userId', userId);

          hideLoginModal();
          getTasks({userId});
        } else {
          alert('ユーザー名、パスワードが違います');
        }
      })
      .catch((err) => {
        alert('通信に失敗しました');
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
        userId = res.content.id;
        localStorage.setItem('userId', userId);

        hideLoginModal();
      })
      .catch(() => {
        alert('通信に失敗しました');
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
        hideCreateTaskModal();
      })
      .catch((err) => {
        alert('保存に失敗しました');
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

  // タブの切り替え
  // hasGetCompletedTasksはすでにajaxで完了済みタスクを取得したかどうかのフラグ
  let hasGetCompletedTasks = false;
  $('#show-completed-tasks').on('click', () => {
    $('#not-completed-task-list').hide();
    $('#completed-task-list').show();

    if (!hasGetCompletedTasks) {
      let requestCompletedTask = true;
      getTasks({userId, requestCompletedTask});

      hasGetCompletedTasks = true;
    }
  });

  $('#show-not-completed-tasks').on('click', () => {
    $('#completed-task-list').hide();
    $('#not-completed-task-list').show();
  });
});
