import Ember from 'ember';

const path = requireNode('path');
const realDirname = __dirname.slice(0, __dirname.indexOf('ghost-desktop') + 13);

export const TestBlog = Ember.Object.extend({
    select: function () {
        Ember.run(() => this.set('isSelected', true));
    },

    unselect: function () {
        Ember.run(() => this.set('isSelected', false));
    },

    getPassword() {
        // We so leet
        return 'p@ssw0rd';
    },

    setPassword() {
        return 'thanks much';
    },

    updateName() {
        return Promise.resolve();
    },

    save() {
        return Promise.resolve();
    }
});

export const getBlogs = () => Ember.A([
    TestBlog.create({
        id: 0,
        name: 'Testblog (Signin)',
        url: path.join(realDirname, 'tests', 'fixtures', 'static-signin', 'signin.html'),
        isSelected: false,
        identification: "test@user.com",
        iconColor: "#008000"
    }),
    TestBlog.create({
        id: 1,
        name: 'Testblog (Content)',
        url: path.join(realDirname, 'tests', 'fixtures', 'static-content', 'content.html'),
        isSelected: false,
        identification: "test@user.com",
        iconColor: "#ff0000"
    }),
    TestBlog.create({
        id: 2,
        name: 'Testblog (New Post)',
        url: path.join(realDirname, 'tests', 'fixtures', 'static-newpost', 'newpost.html'),
        isSelected: false,
        identification: "test@user.com",
        iconColor: "#800080"
    })
]);
