/**
 * file: asathoor.js
 **/

// test
console.log('asathoor.js');

// open links as <a href="x" target="_blank">
$('a').attr({ target:'_blank' });

// add bootstrap classes to .box
$('.box').css(
  {
    // for testing
    //background: 'red'
  }
);
//.before('<div class="row"><div class="col-lg-12 col-md-7 col-md-7">')
//.after('</div></div><!-- end row -->');

// several input boxes are too wide
$('input').css({
  maxWidth: '100%'
})
