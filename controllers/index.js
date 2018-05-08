$(function() {
  // ページロード時の挙動
  // ローカルストレージからuserIdを取得
  // userIdがあればログイン済みなのでtaskを取得し、 なければ登録モーダルを表示
  let userId = localStorage.getItem('userId');
  let ASC_or_DESC = 'DESC';
  let requestDeadline = false;

  if (!userId) {
    showLoginModal();
  } else {
    initScreen();
    // $('#not-completed-task-list').fadeIn(500);
  }

  function initScreen() {
    $('#completed-task-list').empty();
    $('#not-completed-task-list').empty();
    $('#stared-task-list').empty();
    getTasks({userId, ASC_or_DESC, requestDeadline});
    getFavTasks({userId, ASC_or_DESC, requestDeadline});
    $('#main-container').fadeIn(500);
  }

  function getTasks(argument) {
    let userId = argument.userId;
    let ASC_or_DESC = argument.ASC_or_DESC;
    let requestDeadline = argument.requestDeadline;
    let data = {
      userId,
      ASC_or_DESC,
      requestDeadline,
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
      showModalAlert('サーバーが応答しません');
    });
  }

  function getFavTasks(argument) {
    let userId = argument.userId;
    let ASC_or_DESC = argument.ASC_or_DESC;
    let requestDeadline = argument.requestDeadline;
    let data = {
      userId,
      ASC_or_DESC,
      requestDeadline
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
      showModalAlert('通信に失敗しました');
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
      let deadline = task.deadline;
      let createdDate = task.created_at;

      if (deadline) {
        deadline = moment(deadline).format();
        let splitedDeadline = deadline.split('+');
        deadline = splitedDeadline[0];
      }

      createdDate = moment(createdDate).format();
      let splitedCreatedDate = createdDate.split('T');
      createdDate = splitedCreatedDate[0];
      createdDate = moment(createdDate).format('YYYY年MM月DD日');

      let $taskItemDom = $('<div class="task-item">');

      let $completeBtn = $('<button class="task-complete-btn">');
      if (!isRequestStaredTask) {
        $completeBtn.on('click', () => {
          changeTaskStatus(taskId, isCompleted);
        });
      }
      $taskItemDom.append($completeBtn);

      let $taskTitleDom = $('<a class="task-title" href="javascript:void(0);">').on('click', () => {
        showEditTaskModal(taskId, taskTitle, taskDescription, deadline);
      });
      $taskTitleDom.text(taskTitle);
      $taskItemDom.append($taskTitleDom);

      let $favBtnDom;
      if (isStared) {
        $favBtnDom = $('<i class="fas fa-star fav-task-btn">').css({ 'color': '#FDCE00' });
      } else {
        $favBtnDom = $('<i class="far fa-star fav-task-btn fav-task-btn-stared">');
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

      $('.added-date').text(createdDate);

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
      showModalAlert('通信に失敗しました');
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
      .fadeIn(500);

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
        showModalAlert('通信に失敗しました');
      });
    });

    $('#not-delete-task-button').on('click', () => {
      hideConfirmDeleteTaskModal();
    });

    function hideConfirmDeleteTaskModal() {
      $('#confirm-delete-task-modal').fadeOut(200, () => {
        $('#shade').remove();
      });
    }
  }

  // タスクの閲覧編集用モーダル表示して、タスクのデータをアップデートする
  function showEditTaskModal(taskId, taskTitle, taskDescription, deadline) {
    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#edit-task-modal');
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;

    $modalWin
      .before($shade)
      .css({ left: posX, top: posY })
      .fadeIn(500);

    $('#edit-todo-title').val(taskTitle);
    $('#edit-todo-detail').val(taskDescription);
    $('#edit-todo-deadline').val(deadline);

    $('#edit-task-btn').off('click');
    $('#edit-task-btn').on('click', () => {
      let newTitle = $('#edit-todo-title').val();
      let newDetail = $('#edit-todo-detail').val();
      let newDeadline = $('#edit-todo-deadline').val();
      let data = {
        taskId,
        newTitle,
        newDetail,
        newDeadline
      };

      if (!newTitle) {
        return showModalAlert('タイトルは必須です');
      }

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/tasks/edit',
        dataType: 'json',
        data
      })
      .then(() => {
        hideEditTaskModal();
        initScreen();
      })
      .catch(() => {
        showModalAlert('更新に失敗しました');
        hideEditTaskModal();
      });
    });


    $('#close-edit-task-modal').on('click', () => {
      hideEditTaskModal();
    });

    function hideEditTaskModal() {
      $('#edit-task-modal').fadeOut(200, () => {
        $('#shade').remove();
      });
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
      .fadeIn(500);

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
      const todoDeadline = $('#create-todo-deadline').val();

      if (!todoTitle) {
        inProcessingFlag = false;
        return showModalAlert('タイトルを入力してください');
      }

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/tasks/create',
        dataType: 'json',
        data: {
          todoTitle,
          todoDetail,
          userId,
          todoDeadline,
        },
      })
      .then((res) => {
        hideCreateTaskModal();
        initScreen();
      })
      .catch((err) => {
        showModalAlert('保存に失敗しました');
        hideCreateTaskModal();
      });

      inProcessingFlag = false;
    });

    function hideCreateTaskModal() {
      $('#create-task-modal').fadeOut(500, () => {
        $('#shade').remove();
      });
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
      .fadeIn(300)
      .addClass('show');

    let userName;
    let password;

    $('#login').on('click', () => {
      userName = $('#user-name').val();
      password = $('#user-password').val();

      if (!(userName && password)) {
        return showModalAlert('ユーザーネームとパスワードを入力してください');
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
          initScreen();
          showModalAlert('ログインに成功しました');
        } else {
          showModalAlert('ユーザー名、パスワードが違います');
        }
      })
      .catch((err) => {
        showModalAlert('通信に失敗しました');
      });
    });

    $('#sign-up').on('click', () => {
      userName = $('#user-name').val();
      password = $('#user-password').val();

      if (!(userName && password)) {
        return showModalAlert('ユーザーネームとパスワードを入力してください');
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
        showModalAlert('登録に成功しました');
      })
      .catch(() => {
        showModalAlert('通信に失敗しました');
      });
    });

    function hideLoginModal() {
      $('#shade').remove();
      $('#login-modal').css({'display': 'none'});
    }
  }

  // タブの切り替え
  $('#show-completed-tasks').on('click', () => {
    $('#not-completed-task-list').hide();
    $('#stared-task-list').hide();
    $('#completed-task-list').fadeIn(500);
    $('#show-not-completed-tasks').removeClass('is_selected');
    $('#show-stared-tasks').removeClass('is_selected');
    $('#show-completed-tasks').addClass('is_selected');
  });

  $('#show-not-completed-tasks').on('click', () => {
    $('#completed-task-list').hide();
    $('#stared-task-list').hide();
    $('#not-completed-task-list').fadeIn(500);
    $('#show-completed-tasks').removeClass('is_selected');
    $('#show-stared-tasks').removeClass('is_selected');
    $('#show-not-completed-tasks').addClass('is_selected');
  });

  $('#show-stared-tasks').on('click', () => {
    $('#completed-task-list').hide();
    $('#not-completed-task-list').hide();
    $('#stared-task-list').fadeIn(500);
    $('#show-completed-tasks').removeClass('is_selected');
    $('#show-not-completed-tasks').removeClass('is_selected');
    $('#show-stared-tasks').addClass('is_selected');
  });

  function showModalAlert(message) {
    let $modalWin = $('#modal-alert');
    let $window = $(window);

    $modalWin.fadeIn(100);

    $('#modal-alert-contents').text(message);

    $('#close-modal-alert').on('click', () => {
      closeAlert();
    });

    setTimeout(() => {
      closeAlert();
    }, 2000);

    function closeAlert() {
      $('#modal-alert').fadeOut(200);
    }
  }

  $('#sort-way-select').on('change', () => {
    let sortType = $('#sort-way-select').val();

    if (sortType === 'sort-by-deadline') {
      requestDeadline = true;
      initScreen();
      requestDeadline = false;
    }

    if (sortType === 'sort-by-create-desc') {
      ASC_or_DESC = 'DESC';
      initScreen();
    }

    if (sortType === 'sort-by-create-asc') {
      ASC_or_DESC = 'ASC';
      initScreen();
    }
  });

  $('#logout-group').on('click', () => {
    let $shade = $('<div></div>');
    $shade.attr('id', 'shade');

    let $modalWin = $('#logout-modal');
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;

    $modalWin
      .before($shade)
      .css({ left: posX, top: posY })
      .fadeIn(500);

    $('#logout-button').off('click');
    $('#logout-button').on('click', () => {
      localStorage.removeItem('userId');
      $('#completed-task-list').empty();
      $('#not-completed-task-list').empty();
      $('#stared-task-list').empty();
      hideLogoutModal();

      setTimeout(() => {
        showLoginModal();
      }, 1000);
    });

    $('#not-logout-button').on('click', () => {
      hideLogoutModal();
    });

    function hideLogoutModal() {
      $('#logout-modal').fadeOut(200, () => {
        $('#shade').remove();
      });
    }
  });
});
