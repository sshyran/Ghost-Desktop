import {computed} from '@ember/object';
import {inject} from '@ember/service';
import Component from '@ember/component';

import getLanguageName from '../utils/iso639';

export default Component.extend({
    preferences: inject.service(),

    availableDictionaries: computed({
        get() {
            const checker = requireNode('spellchecker');
            let dicts = [];

            if (checker) {
                dicts = checker.getAvailableDictionaries();
                dicts = dicts.map((dict) => getLanguageName(dict));
            }

            if (dicts.length === 0) {
                dicts.push(getLanguageName('en_US'));
            }

            return dicts;
        }
    }),

    selectedDictionary: computed({
        get() {
            const key = this.get('preferences.spellcheckLanguage');
            const available = this.get('availableDictionaries');
            const language = available.findBy('key', key);

            return language;
        },
        set(key, dict) {
            this.set('preferences.spellcheckLanguage', dict.key);
        }
    }),

    actions: {
        setDictionary(dict) {
            this.set('selectedDictionary', dict);
            this.get('preferences').trigger('selectedDictionaryChanged');
        }
    }
});
