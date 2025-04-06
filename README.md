# HyperionScripts

**HyperionScripts** is a browser extension designed to automate sneaker purchases during high-demand drops and limited sales. It streamlines the buying process across top sneaker platforms and integrates with Discord for real-time notifications.

> ⚠️ **Note**: This extension was developed in **2021** and may no longer work as intended due to changes in the supported sites' layouts or anti-bot protections. No active maintenance is currently provided.


> ⚠️ **Disclaimer**: This project is for educational purposes only. Use responsibly and at your own risk. Automating purchases may violate site terms of service.


---

## 🔍 Overview


> 📅 **Project Status**: This tool was developed in **2021** and is no longer actively maintained. Functionality may be partially or fully broken due to site updates or anti-bot mechanisms.

---

HyperionScripts was built to increase the chances of successfully purchasing limited-release sneakers by automating key steps in the buying process. It supports multiple platforms and enables fast actions during product drops.

### Supported Sites

- Solebox  
- Snipes  
- Zalando  
- Offspring  
- LVR (LuisaViaRoma)

---

## 🚀 Features

- 🛒 Auto Cart & Checkout: Automatically adds products to cart and navigates through checkout.  
- 🌐 Multi-Site Support: Scripts tailored for each supported store's structure and flow.  
- 🔔 Discord Webhook Integration: Sends instant notifications when actions are triggered or completed.  
- ⚙️ Custom Configs: Easily define preferences like product size, delay times, and webhook URLs.  
- 🧩 Modular Design: Each site has its own script folder for easy updates and maintenance.  

---

## 🛠 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/janmunts/HyperionScripts.git
   cd HyperionScripts
   ```

2. Load as an unpacked extension in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load unpacked**
   - Select the root directory of the cloned repo

3. Update `config.json` with your preferences and webhook URL

---

## ⚙ Configuration

Edit the `config.json` file in the root directory to define:
- Product size
- Target URLs or SKUs
- Webhook URL
- Site-specific options

### Example

```json
{
  "webhook_url": "https://discord.com/api/webhooks/...",
  "sites": {
    "zalando": {
      "autobuy": true,
      "size": "42",
      "retry_delay": 1000
    },
    "snipes": {
      "autobuy": false,
      "notify_only": true
    }
  }
}
```

---

## 💬 Discord Webhook

HyperionScripts supports sending real-time notifications via Discord webhooks. These alerts include:

- Product added to cart
- Checkout started or completed
- Errors or site-specific notices

Make sure to update the `webhook_url` in your configuration file.

---

## 📁 Structure

```
HyperionScripts/
├── config.json
├── discord/
├── icons/
├── notifications/
├── snipes/
├── solebox/
├── zalando/
├── offspring/
├── lvr/
└── manifest.json
```

Each site folder contains its own automation script tailored to the corresponding site's structure.

---

## 🧑‍💻 Contributing

Pull requests are welcome. If you want to add new features or support more sites:
1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Submit a pull request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

Built by [@janmunts](https://github.com/janmunts) to challenge automation limits and explore high-demand purchase flows.
