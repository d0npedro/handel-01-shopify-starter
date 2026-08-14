# Shopify-Metafelder

Namespace für alle Felder: `custom`.

| Key | Typ | Zweck |
| --- | --- | --- |
| `product_kind` | Einzeiliger Text | `physical`, `script`, `music` oder `software` |
| `short_description` | Mehrzeiliger Text | kurze Katalogbeschreibung |
| `delivery_note` | Einzeiliger Text | konkrete Lieferzeit oder digitale Bereitstellung |
| `highlights` | Einzeiliger Text | Merkmale, durch `|` getrennt |
| `unit_price` | Einzeiliger Text | Grundpreis, sofern erforderlich |
| `lowest_price_30d` | Einzeiliger Text | niedrigster Warenpreis der letzten 30 Tage bei Preisermäßigung |
| `license` | Mehrzeiliger Text | eingeräumte Nutzungsrechte digitaler Produkte |
| `file_details` | Mehrzeiliger Text | Dateiformat, Größe, DRM und Bereitstellung |
| `system_requirements` | Mehrzeiliger Text | Funktionalität, Kompatibilität, Interoperabilität |
| `manufacturer` | Einzeiliger Text | Herstellername für physische Produkte |
| `manufacturer_address` | Mehrzeiliger Text | vollständige postalische Herstelleradresse |
| `manufacturer_email` | Einzeiliger Text | elektronischer Herstellerkontakt |
| `safety_information` | Mehrzeiliger Text | Warn- und Sicherheitsinformationen in deutscher Sprache |

Bei Herstellern außerhalb der EU muss die nach GPSR verantwortliche Person zusätzlich abgebildet werden. Dazu entweder Herstellerfelder für den verantwortlichen EU-Wirtschaftsakteur verwenden oder das Datenmodell gezielt um eigene Responsible-Person-Felder erweitern.

Produktseiten dürfen erst veröffentlicht werden, wenn alle für den konkreten Produkttyp erforderlichen Felder vollständig sind.
