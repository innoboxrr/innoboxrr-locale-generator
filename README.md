# 🈯 Locale Generator

> Herramienta CLI para extraer cadenas traducibles de tu proyecto (como `__t("...")` o `__lang("...")`), traducirlas automáticamente y generar archivos JSON de localización para Vue o cualquier entorno JavaScript.

---

## 🚀 Características

* 📦 Extrae cadenas de texto desde archivos `.vue`, `.js`, `.ts`, `.html`, `.py`
* 🌍 Traduce automáticamente con la API de Google Translate (opcional)
* 🧠 Evita duplicados automáticamente
* 📁 Genera archivos `locales/{idioma}.json` listos para `vue-i18n`, Nuxt, etc.
* 🛠️ Configuración por CLI o por archivo `locale.config.js`
* ✅ Compatible con `.env` para tu clave de API

---

## 📦 Instalación

```bash
npm install innoboxrr-locale-generator
```

---

## ⚙️ Uso básico

```bash
npx locale-gen es fr -t -f ./src -m __t
```

---

### 🧾 Parámetros

| Opción         | Descripción                                                    |
| -------------- | -------------------------------------------------------------- |
| `es fr`        | Idiomas destino separados por espacio (`es`, `en`, `fr`, etc.) |
| `-t`           | Traducción automática usando Google Translate                  |
| `-f`           | Ruta del archivo o carpeta a analizar (por defecto: `./src`)   |
| `-m`           | Método o helper a buscar (por defecto: `__lang`)          |
| `-h`, `--help` | Muestra la ayuda                                               |

---

## 🛠️ Uso con archivo de configuración

Puedes crear un archivo `locale.config.js` en la raíz de tu proyecto con esta forma:

```js
module.exports = {
    method: '__lang',
    sourcePath: './src',
    languages: ['es', 'en'],
    translate: true
};
```

Después, simplemente ejecuta:

```bash
npx locale-gen
```

---

## 🌐 .env

Crea un archivo `.env` en la raíz con tu API key de Google Translate:

```
GOOGLE_TRANSLATE_KEY=tu-clave-api-de-google
```

---

## 🧪 Ejemplo de resultado

Al ejecutar el CLI, se genera un archivo como `src/locales/es.json` con contenido como este:

```json
{
    "Welcome to the blog": "Bienvenido al blog",
    "Learn Python easily": "Aprende Python fácilmente"
}
```

---

## 📁 Estructura típica del proyecto

```
tu-proyecto/
├── src/
│   ├── componentes/
│   └── locales/
│       ├── es.json
│       └── en.json
├── .env
├── locale.config.js
```

---

## 🧑‍💻 Contribuciones

¿Ideas, bugs, mejoras? ¡Bienvenidas! Abre un issue o haz un PR 🚀

---

## 📄 Licencia

MIT © Raúl – Úsalo con libertad y crea productos multilingües de calidad.

