# 📧 Como Configurar o Email do Sistema

## O sistema precisa de UM email para enviar códigos de verificação

### Passo 1: Criar/Usar uma conta Gmail
Use um email dedicado para o sistema (ex: `barbermasterapp@gmail.com`)

### Passo 2: Ativar Verificação em 2 Etapas
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"

### Passo 3: Gerar Senha de App
1. Na mesma página de segurança, procure "Senhas de app"
2. Selecione "Mail" e "Outro dispositivo"
3. Copie a senha de 16 dígitos gerada

### Passo 4: Configurar o .env
Edite o arquivo `backend/.env`:
```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx (senha de 16 dígitos)
```

### Passo 5: Reiniciar o servidor
```bash
npm run dev
```

## Como Funciona
- O sistema usa ESTE email para ENVIAR códigos
- Cada barbeiro recebe o código NO EMAIL DELE
- É como um "carteiro" do sistema 📬
