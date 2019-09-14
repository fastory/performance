import Vue from 'vue'
import Router from 'vue-router'
import Performance from './views/Performance.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/",
      name: "performance",
      component: Performance
    },{
      path: "/",
      name: "performance",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
          import(/* webpackChunkName: "about" */ "./views/Performance.vue")
    }, {
      path: "/time",
      name: "time",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
          import(/* webpackChunkName: "about" */ "./views/Time.vue")
    } ]
});
