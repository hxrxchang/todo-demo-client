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
  });
});
