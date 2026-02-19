
/*
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'


// 2. LE DECIMOS A LA APP QUE USE EL ROUTER
// Esta es la línea que te falta o que no está funcionando
app.use(router) 

app.mount('#app')
createApp(App).mount('#app')
*/

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 1. Creamos la instancia de la aplicación y la guardamos en la constante 'app'
const app = createApp(App)

// 2. Conectamos el router a la aplicación
app.use(router)

// 3. Finalmente, montamos la aplicación en el div con id "app" del index.html
app.mount('#app')
