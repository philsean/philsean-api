<center><img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=Yby&fontSize=80&fontAlignY=35&animation=twinkling&fontColor=gradient" /></center>

# 🎨 Yby API

API para **geração dinâmica de imagens** usando Canvas via HTTP.  
Permite compor imagens a partir de **formas, textos e imagens externas**, retornando uma URL temporária para acesso ao PNG gerado.

---

## 📍 Base URL

```
https://ybyapi.vercel.app/api/v1
```

---

## 🚀 Endpoint Disponível

### `POST /canvas`

Cria uma imagem PNG dinamicamente com base nas configurações enviadas no body.

---

## 📥 Request

### Headers
```
Content-Type: application/json
```

---

### Body (JSON)

```json
{
  "width": 800,
  "height": 400,
  "images": [],
  "shapes": []
}
```

---

### 🔧 Parâmetros

#### `width` (number) **[obrigatório]**
Largura do canvas em pixels.

#### `height` (number) **[obrigatório]**
Altura do canvas em pixels.

#### `images` (array) *(opcional)*
Lista de imagens externas que podem ser usadas nas shapes do tipo `image`.

```json
{
  "name": "logo",
  "link": "https://exemplo.com/logo.png"
}
```

| Campo | Tipo | Descrição |
|------|-----|----------|
| name | string | Identificador da imagem |
| link | string | URL pública da imagem |

---

#### `shapes` (array) *(opcional)*
Lista de elementos desenhados no canvas.

Cada item deve conter obrigatoriamente o campo `name`, que define o tipo da shape.

---

## 🧩 Tipos de Shapes

### 🟦 `rect`
Desenha um retângulo.

```json
{
  "name": "rect",
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 100,
  "color": "#ff0000",
  "radius": 10
}
```

---

### ⚪ `circle`
Desenha um círculo.

```json
{
  "name": "circle",
  "x": 300,
  "y": 150,
  "radius": 50,
  "color": "#00ff00"
}
```

---

### ✍️ `text`
Desenha texto no canvas.

```json
{
  "name": "text",
  "text": "Hello World",
  "x": 100,
  "y": 300,
  "font": "32px Inter",
  "color": "#ffffff",
  "textAlign": "left",
  "textBaseline": "alphabetic",
  "strokeColor": "#000000",
  "strokeWidth": 2
}
```

---

### 🖼️ `image`
Desenha uma imagem previamente carregada em `images`.

```json
{
  "name": "image",
  "image": "logo",
  "x": 400,
  "y": 50,
  "width": 200,
  "height": 200,
  "radius": 20
}
```

---

## 🌫️ Sombras (opcional para qualquer shape)

```json
{
  "shadowColor": "rgba(0,0,0,0.5)",
  "shadowBlur": 10,
  "shadowOffsetX": 5,
  "shadowOffsetY": 5
}
```

---

## 📤 Response — Sucesso (200)

```json
{
  "image": "https://ybyapi.vercel.app/api/v1/canvas/abc123.png",
  "logs": [
    "2 images have been uploaded.",
    "5 shapes have been drawn."
  ],
  "parsedErrors": []
}
```

### 🔗 A imagem fica disponível temporariamente (TTL: 1 hora).

---

## ⚠️ Response — Erro de validação (400)

```json
{
  "message": "The 'width/height' options are either missing or not valid numbers."
}
```

---

## ❌ Response — Imagem expirada (404)

```json
{
  "message": "Image expired or not found."
}
```

---

## 📥 GET /canvas/:id.png

Retorna a imagem gerada anteriormente.

### Exemplo
```
GET /canvas/abc123.png
```

### Response
- `200` → PNG
- `404` → imagem não encontrada ou expirada

---

## 🛑 Rotas inválidas

### `GET /canvas`

```json
{
  "message": "For this endpoint, use the POST method."
}
```

---

## 🧪 Exemplo completo de uso (POST)

```json
{
  "width": 800,
  "height": 400,
  "images": [
    {
      "name": "logo",
      "link": "https://exemplo.com/logo.png"
    }
  ],
  "shapes": [
    {
      "name": "rect",
      "x": 0,
      "y": 0,
      "width": 800,
      "height": 400,
      "color": "#121212"
    },
    {
      "name": "text",
      "text": "YBY API",
      "x": 50,
      "y": 100,
      "font": "48px Inter",
      "color": "#ffffff"
    },
    {
      "name": "image",
      "image": "logo",
      "x": 550,
      "y": 100,
      "width": 200,
      "height": 200
    }
  ]
}
```