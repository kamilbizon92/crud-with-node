if (document.querySelector('.delete-article')) {
  const target = document.querySelector('.delete-article');
  target.addEventListener('click', deleteArticle);

  function deleteArticle() {
    const id = target.getAttribute('data-id');
    if (confirm('Delete article?')) {
      let xhr = new XMLHttpRequest();
      xhr.open('DELETE', `${id}`, true);

      xhr.onload = function() {
        if (this.status == 200) {
          window.location.href = '/';
        } else {
          console.log('Error');
        }
      }
      xhr.send();
    }
  }
}