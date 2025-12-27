# La Mafilia Games

Este proyecto es una aplicación desarrollada con **Expo** y **React Native**. La aplicación contiene diferentes pantallas y funcionalidades organizadas en una estructura modular.

# Idea Familiar
La idea nació una Navidad, cuando en familia nos dimos cuenta de que queríamos hacer alguna actividad divertida, pero no teníamos ni una app ni un juego de mesa que juntara todos los juegos que nos gustan. Por eso decidí recopilar las ideas de nuestros juegos favoritos y reunirlos en un solo lugar.

Aunque hoy tengamos estas actividades en un celular, *los juegos NO están pensados para estar pegados a la tecnología*. Somos una familia que disfruta las fiestas y las juntadas en grupo, con juegos de por medio, pero jugándolos en persona, hablando, riendo y compartiendo el momento, **NO conectados a la tecnología**.


## Estructura del Proyecto

La estructura del proyecto es la siguiente:

```
LaMafiliaGames/
├── App.js
├── app.json
├── eas.json
├── index.js
├── package.json
├── assets/
├── src/
│   ├── components/
│   ├── data/
│   │   ├── impostorWords.js
│   │   └── tabuWords.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── akisum/
│   │   │   └── AkisumGameScreen.js
│   │   ├── impostor/
│   │   │   ├── ImpostorConfigScreen.js
│   │   │   ├── ImpostorGameScreen.js
│   │   │   ├── ImpostorResultScreen.js
│   │   │   └── ImpostorRevealScreen.js
│   │   └── tabu/
│   │       ├── TabuConfigScreen.js
│   ├── styles/
│   ├── utils/
```

### Descripción de Carpetas y Archivos

- **App.js**: Archivo principal de la aplicación donde se inicializa la navegación y configuración global.
- **app.json**: Configuración de Expo para el proyecto.
- **eas.json**: Configuración para EAS (Expo Application Services).
- **index.js**: Punto de entrada de la aplicación.
- **package.json**: Archivo de configuración de dependencias y scripts del proyecto.
- **assets/**: Carpeta que contiene los recursos estáticos como imágenes, íconos y otros activos.
- **src/**: Carpeta principal que contiene el código fuente de la aplicación.
  - **components/**: Componentes reutilizables de la aplicación.
  - **data/**: Archivos de datos estáticos o configuraciones, como `impostorWords.js` y `tabuWords.js`.
  - **screens/**: Pantallas de la aplicación.
    - **HomeScreen.js**: Pantalla principal de la aplicación.
    - **akisum/**: Subcarpeta que contiene las pantallas relacionadas con el juego "Akisum".
      - **AkisumGameScreen.js**: Pantalla principal del juego Akisum.
    - **impostor/**: Subcarpeta que contiene las pantallas relacionadas con el juego "Impostor".
      - **ImpostorConfigScreen.js**: Pantalla de configuración del juego.
      - **ImpostorGameScreen.js**: Pantalla principal del juego.
      - **ImpostorResultScreen.js**: Pantalla de resultados del juego.
      - **ImpostorRevealScreen.js**: Pantalla de revelación del impostor.
    - **tabu/**: Subcarpeta que contiene las pantallas relacionadas con el juego "Tabú".
      - **TabuConfigScreen.js**: Pantalla de configuración del juego Tabú.
  - **styles/**: Archivos de estilos globales y específicos.
  - **utils/**: Funciones y utilidades reutilizables.

## Requisitos

- Node.js
- Expo CLI

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el proyecto:
   ```bash
   npx expo start
   ```

## Construcción

Para generar una build de la aplicación, utiliza el comando:
```bash
eas build -p android --profile preview
```

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

## Créditos
Hecho con **mucho amor** y **dedicación** por Fabrizio Catanzaro Pfahler.