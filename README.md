# 🈯 Locale Generator

> Herramienta CLI para extraer las cadenas traducibles de tu proyecto (las llamadas a `t('...')`), traducirlas con Google Translate si quieres y generar un JSON de traducciones por idioma.

Es la que usa el módulo de interfaz que genera [LaraPack](https://github.com/innoboxrr/larapack-generator) con `npm run locale`, y el método por defecto, `t`, es el que exporta [`innoboxrr-i18n`](https://www.npmjs.com/package/innoboxrr-i18n).

Documentación completa del ecosistema, en español y en inglés: <https://innoboxrr.github.io/docs/interfaz/http-rutas-i18n>.

---

## 🚀 Qué hace

* 📦 Busca las llamadas al método (por defecto `t`) en archivos `.vue`, `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.html` y `.php`.
* 🌍 Traduce las claves nuevas con la API de Google Translate (opcional, con `-t`).
* 🧠 Conserva lo que ya estaba traducido y no duplica claves.
* 📁 Escribe un `{idioma}.json` por idioma, por defecto en `./src/locales`.
* 🛠️ Se configura por línea de comandos o con `locale.config.js`.

---

## 📦 Instalación

```bash
npm install --save-dev innoboxrr-locale-generator
```

---

## ⚙️ Uso

```bash
npx locale-gen es en -f ./src -o ./src/locales
```

| Opción | Qué hace | Por defecto |
| --- | --- | --- |
| `es en` | Idiomas destino, separados por espacio | `es en` |
| `-f [ruta]` | Archivo o directorio a analizar | `./src` |
| `-o [ruta]` | Dónde escribir los `.json` | `./src/locales` |
| `-m [método]` | Método cuyas llamadas se buscan | `t` |
| `-t` | Traduce las claves nuevas con Google Translate | no |
| `-v` | Lista las cadenas encontradas en cada archivo | no |
| `-h`, `--help` | Muestra la ayuda | |

---

## 🛠️ Con archivo de configuración

Crea `locale.config.js` en la raíz del proyecto. La línea de comandos gana sobre el archivo, y el archivo sobre los valores por defecto:

```js
module.exports = {
    languages: ['es', 'en'],
    method: 't',
    sourcePath: './src',
    outputPath: './src/locales',
    translate: false,
};
```

Y ejecuta:

```bash
npx locale-gen
```

---

## 🌐 Traducción automática

Con `-t` (o `translate: true`), la herramienta pide a Google Translate las claves que aún no tienen traducción. Pon tu API key en un `.env` en la raíz:

```
GOOGLE_TRANSLATE_KEY=tu-clave-api-de-google
```

El paquete de Laravel [`innoboxrr/locale-generator`](https://github.com/innoboxrr/locale-generator) usa otra variable, `GOOGLE_TRANSLATE_API_KEY`: si usas los dos, define ambas.

---

## 🧪 Resultado

Para un componente con `t('Welcome to the blog')`, `src/locales/es.json` queda así:

```json
{
    "Welcome to the blog": "Bienvenido al blog"
}
```

Sin `-t`, las claves nuevas se añaden con el valor vacío (`""`), que `innoboxrr-i18n` trata como pendiente de traducir.

---

## 📄 Licencia

MIT
