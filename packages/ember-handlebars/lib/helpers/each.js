require("ember-handlebars/ext");
require("ember-views/views/collection_view");
require("ember-handlebars/views/metamorph_view");

/**
@module ember
@submodule ember-handlebars
*/

var get = Ember.get, set = Ember.set;

Ember.Handlebars.EachView = Ember.CollectionView.extend(Ember._Metamorph, {
  itemViewClass: Ember._MetamorphView,
  emptyViewClass: Ember._MetamorphView,

  createChildView: function(view, attrs) {
    view = this._super(view, attrs);

    // At the moment, if a container view subclass wants
    // to insert keywords, it is responsible for cloning
    // the keywords hash. This will be fixed momentarily.
    var keyword = get(this, 'keyword');

    if (keyword) {
      var data = get(view, 'templateData');

      data = Ember.copy(data);
      data.keywords = view.cloneKeywords();
      set(view, 'templateData', data);

      var content = get(view, 'content');

      // In this case, we do not bind, because the `content` of
      // a #each item cannot change.
      data.keywords[keyword] = content;
    }

    return view;
  }
});

/**
  The `{{#each}}` helper loops over elements in a collection, rendering its block once for each item:

        Developers = [{name: 'Yehuda'},{name: 'Tom'}, {name: 'Paul'}];

        {{#each Developers}}
          {{name}}
        {{/each}}


  `{{each}}` supports an alternative syntax with element naming:

        {{#each person in Developers}}
          {{person.name}}
        {{/each}}

  When looping over objects that do not have properties, `{{this}}` can be used to render the object:

        DeveloperNames = ['Yehuda', 'Tom', 'Paul']

        {{#each DeveloperNames}}
          {{this}}
        {{/each}}

  ### Blockless Use

  If you provide an `itemViewClass` option that has its own `template` you can omit
  the block in a similar way to how it can be done with the collection helper.

  The following template:

      <script type="text/x-handlebars">
        {{#view App.MyView }}
          {{each view.items itemViewClass="App.AnItemView"}} 
        {{/view}}
      </script>

  And application code

      App = Ember.Application.create({
        MyView: Ember.View.extend({
          items: [
            Ember.Object.create({name: 'Dave'}),
            Ember.Object.create({name: 'Mary'}),
            Ember.Object.create({name: 'Sara'})
          ]
        })
      });


      App.AnItemView = Ember.View.extend({
        template: Ember.Handlebars.compile("Greetings {{name}}")
      })
      
      App.initialize();
      
  Will result in the HTML structure below

      <div class="ember-view">
        <div class="ember-view">Greetings Dave</div>
        <div class="ember-view">Greetings Mary</div>
        <div class="ember-view">Greetings Sara</div>
      </div>


  @method each
  @for Ember.Handlebars.helpers
  @param [name] {String} name for item (used with `in`)
  @param path {String} path
*/
Ember.Handlebars.registerHelper('each', function(path, options) {
  if (arguments.length === 4) {
    Ember.assert("If you pass more than one argument to the each helper, it must be in the form #each foo in bar", arguments[1] === "in");

    var keywordName = arguments[0];

    options = arguments[3];
    path = arguments[2];
    if (path === '') { path = "this"; }

    options.hash.keyword = keywordName;
  } else {
    options.hash.eachHelper = 'each';
  }

  options.hash.contentBinding = path;
  // Set up emptyView as a metamorph with no tag
  //options.hash.emptyViewClass = Ember._MetamorphView;

  return Ember.Handlebars.helpers.collection.call(this, 'Ember.Handlebars.EachView', options);
});
