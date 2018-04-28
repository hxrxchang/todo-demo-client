$(() => {
  // ページロードじにストレージからデータを持ってくる

  // モーダル表示
  $('#open-add-memo-modal-btn').on('click', showModal);

  function showModal(event) {
    event.preventDefault();

    let $shade = $('<div></div>');
    $shade
      .attr('id', 'shade')

    let $modalWin = $('#modalwin');
    // windowはwindowオブジェクトのこと
    let $window = $(window);
    let posX = ($window.width() - $modalWin.outerWidth()) / 2;
    let posY = ($window.height() - $modalWin.outerHeight()) / 2;

    $modalWin
      .before($shade)
      .css({left: posX, top: posY})
      .removeClass('hide')
      .addClass('show')
      .on('click', 'button', () => {
        hideModal();
      });
  }

  function hideModal () {
    $('#shade').remove();
    $('#modalwin')
      .removeClass('show')
      .addClass('hide');
  }

  $('#create-memo-btn').on('click', () => {
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
      console.log('1111111111111111111111');
      console.log(res);
    })
    .catch((err) => {
      console.log('00000000000000000000000000');
      console.log(err);
    });
  });
});
