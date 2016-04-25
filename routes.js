Router.configure({
   layoutTemplate: 'layout'  //can be any template name
 });



Router.map(function () {
  this.route('home', {
  path: '/'
});
  this.route('application');
  this.route('instructions');
  this.route('articles');
  this.route('about');
  this.route('code');

});
