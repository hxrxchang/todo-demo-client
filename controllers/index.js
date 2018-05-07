$(function() {
  // ページロード時の挙動
  // ローカルストレージからuserIdを取得
  // userIdがあればログイン済みなのでtaskを取得し、 なければ登録モーダルを表示
  let userId = localStorage.getItem('userId');
  let ASC_or_DESC = 'DESC';

  if (!userId) {
    showLoginModal();
  } else {
    initScreen();
  }

  function initScreen() {
    $('#completed-task-list').empty();
    $('#not-completed-task-list').empty();
    $('#stared-task-list').empty();
    getTasks(userId, ASC_or_DESC);
    getFavTasks(userId, ASC_or_DESC);
  }

  function getTasks(userId, ASC_or_DESC) {
    let data = {
      userId,
      ASC_or_DESC
    };

    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/tasks',
      dataType: 'json',
      data
    })
    .then((res) => {
      let taskList = res.content;
      let whereToRender = false;
      renderDom(taskList, whereToRender);
    })
    .catch((err) => {
      alert('サーバーが応答しません');
    });
  }

  function getFavTasks(userId, ASC_or_DESC) {
    let data = {
      userId,
      ASC_or_DESC
    };

    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/tasks/star/get',
      dataType: 'json',
      data
    })
    .then((res) => {
      let taskList = res.content;
      let whereToRender = $('#stared-task-list');
      renderDom(taskList, whereToRender);
    })
    .catch((err) => {
      alert('通信に失敗しました');
    })
  }

  function renderDom(taskList, whereToRender) {
    let isRequestStaredTask = false;
    if (whereToRender) isRequestStaredTask = true;

    taskList.forEach((task) => {
      let taskId = task.id;
      let taskTitle = task.title;
      let taskDescription = task.description;
      let isCompleted = task.is_completed;
      let isStared = task.is_stared;

      let $taskItemDom = $('<div class="task-item">');

      let $completeBtn = $('<button class="task-complete-btn">');
      if (!isRequestStaredTask) {
        $completeBtn.on('click', () => {
          changeTaskStatus(taskId, isCompleted);
        });
      }
      $taskItemDom.append($completeBtn);

      let $taskTitleDom = $('<a class="task-title" href="javascript:void(0);">').on('click', () => {
        showEditTaskModal(taskId, taskTitle, taskDescription);
      });
      $taskTitleDom.text(taskTitle);
      $taskItemDom.append($taskTitleDom);

      let $favBtnDom;
      if (isStared) {
        $favBtnDom = $('<i class="fas fa-star fav-task-btn">').css({ 'color': '#FDCE00' });
      } else {
        $favBtnDom = $('<i class="far fa-star fav-task-btn">');
      }
      $favBtnDom.on('click', () => {
        addFavoriteTask(taskId);
      });

      $taskItemDom.append($favBtnDom);

      let $deleteBtnDom = $('<i class="far fa-trash-alt delete-task-btn">')
      $deleteBtnDom.on('click', () => {
        showConfirmDeleteTaskModal(taskId, $taskItemDom);
      });
      $taskItemDom.append($deleteBtnDom);

      if (isRequestStaredTask) {
        return whereToRender.append($taskItemDom);
      }

      if (isCompleted) {
        $('#completed-task-list').append($taskItemDom);
      } else {
        $('#not-completed-task-list').append($taskItemDom);
      }
    });
  }

  // タスクの完了未完了を切り替えるAPIを叩く関数
  function changeTaskStatus(taskId, isCompleted) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/tasks/complete',
      dataType: 'json',
      data: {
        taskId,
        isCompleted,
      },
    })
    .then(() => {
      initScreen();
    });
  }

  function addFavoriteTask(taskId) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/tasks/star',
      dataType: 'json',
      data: {
        taskId,
      }
    })
    .then(() => {
      initScreen();
    })
    .catch(() => {
      alert('通信に失敗しました');
    });
  }

  // モーダルを表示して、タスクを削除するAPIを叩く関数
  function showConfirmDeleteTaskModal(taskId, $taskItemDom) {
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

    $('#delete-task-button').off('click');
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
        initScreen();
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

  // タスクの閲覧編集用モーダル表示して、タスクのデータをアップデートする
  function showEditTaskModal(taskId, taskTitle, taskDescription) {
    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#edit-task-modal');
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;

    $modalWin
      .before($shade)
      .css({ left: posX, top: posY })
      .removeClass('hide')
      .addClass('show');

    $('#edit-todo-title').val(taskTitle);
    $('#edit-todo-detail').val(taskDescription);

    $('#edit-task-btn').off('click');
    $('#edit-task-btn').on('click', () => {
      let newTitle = $('#edit-todo-title').val();
      let newDetail = $('#edit-todo-detail').val();

      if (!newTitle) {
        return alert('タイトルは必須です');
      }

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/tasks/edit',
        dataType: 'json',
        data: {
          taskId,
          newTitle,
          newDetail
        }
      })
      .then(() => {
        hideEditTaskModal();
        initScreen();
      })
      .catch(() => {
        alert('更新に失敗しました');
        hideEditTaskModal();
      });
    });


    $('#close-edit-task-modal').on('click', () => {
      hideEditTaskModal();
    });

    function hideEditTaskModal() {
      $('#shade').remove();
      $('#edit-task-modal')
        .removeClass('show')
        .addClass('hide');
    }
  }

  // タスク作成モーダル表示
  $('#open-add-memo-modal-btn').on('click', showCreateTaskModal);

  function showCreateTaskModal() {
    $('#create-todo-title').val('');
    $('#create-todo-detail').val('');

    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#create-task-modal');
    // windowはwindowオブジェクトのこと
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;

    $modalWin
      .before($shade)
      .css({ left: posX, top: posY })
      .removeClass('hide')
      .addClass('show');

    $('#close-task-modal').on('click', () => {
      hideCreateTaskModal();
    });

    let inProcessingFlag = false;
    $('#create-task-btn').off('click');
    $('#create-task-btn').on('click', () => {
      if (inProcessingFlag) {
        return false;
      }

      inProcessingFlag = true;

      const todoTitle = $('#create-todo-title').val();
      const todoDetail = $('#create-todo-detail').val();

      if (!todoTitle) {
        inProcessingFlag = false;
        return alert('タイトルを入力してください');
      }

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
        initScreen();
      })
      .catch((err) => {
        alert('保存に失敗しました');
        hideCreateTaskModal();
      });

      inProcessingFlag = false;
    });

    function hideCreateTaskModal() {
      $('#shade').remove();
      $('#create-task-modal')
        .removeClass('show')
        .addClass('hide');
    }
  }

  // ログイン、サインアップ用のモーダル
  // ローカルストレージにユーザーデータがないときに呼ばれる
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

      if (!(userName && password)) {
        return alert('ユーザーネームとパスワードを入力してください');
      }

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
          getTasks(userId, ASC_or_DESC);
          alert('ログインに成功しました');
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

      if (!(userName && password)) {
        return alert('ユーザーネームとパスワードを入力してください');
      }

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
        alert('登録に成功しました');
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

  // タブの切り替え
  $('#show-completed-tasks').on('click', () => {
    $('#not-completed-task-list').hide();
    $('#stared-task-list').hide();
    $('#completed-task-list').show();
    $('#show-not-completed-tasks').css({
      'border-bottom': 'none',
      'color': 'gray'
    });
    $('#show-stared-tasks').css({
      'border-bottom': 'none',
      'color': 'gray'
    });
    $('#show-completed-tasks').css({
      'border-bottom': '6px solid red',
      'color': 'black'
    });
  });

  $('#show-not-completed-tasks').on('click', () => {
    $('#completed-task-list').hide();
    $('#stared-task-list').hide();
    $('#not-completed-task-list').show();
    $('#show-completed-tasks').css({
      'border-bottom': 'none',
      'color': 'gray'
    });
    $('#show-stared-tasks').css({
      'border-bottom': 'none',
      'color': 'gray'
    });
    $('#show-not-completed-tasks').css({
      'border-bottom': '6px solid red',
      'color': 'black'
    });
  });

  $('#show-stared-tasks').on('click', () => {
    $('#completed-task-list').hide();
    $('#not-completed-task-list').hide();
    $('#stared-task-list').show();
    $('#show-completed-tasks').css({
      'border-bottom': 'none',
      'color': 'gray'
    });
    $('#show-not-completed-tasks').css({
      'border-bottom': 'none',
      'color': 'gray'
    });
    $('#show-stared-tasks').css({
      'border-bottom': '6px solid red',
      'color': 'black'
    });
  });

  $('#sorting-btn').on('click', () => {
    if (ASC_or_DESC === 'ASC') {
      ASC_or_DESC = 'DESC';
      initScreen();
      $('#sorting-icon').text('新しい順に並べ替える');
    } else if (ASC_or_DESC === 'DESC') {
      ASC_or_DESC = 'ASC';
      initScreen();
      $('#sorting-icon').text('古い順に並べ替える');
    }
  });
});
