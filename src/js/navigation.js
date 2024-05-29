const navigation = document.querySelector('.navigation');
const navigationToggle = navigation.querySelector('.navigation__toggle');
const icon = navigationToggle.querySelector('svg');

navigation.classList.add('navigation--hidden');

navigationToggle.addEventListener('click', () => {
    if (navigation.classList.contains('navigation--hidden')) {
        icon.innerHTML = `
      <use xlink:href="img/sprite.svg#close"  />
    `;
    } else {
        icon.innerHTML = `
      <use xlink:href="img/sprite.svg#menu"/>
    `;
    }
    navigation.classList.toggle('navigation--hidden')
});
