# Propuesta: Cuadro "Datos de Despacho / Retiro" autocompletado (Rental)

## Estado: PROPUESTA (16-10-2026) — pendiente OK de Simón y probar en Sandbox

## Para qué

Hoy el vendedor Rental, además de la cotización, arma a mano un cuadro
"DATOS DE DESPACHO / RETIRO" con casi los mismos datos. La idea: que cuando
la cotización Rental quede **Cerrada Ganada**, le llegue al vendedor un
correo con el cuadro **ya llenado con lo que hay en el CRM**, y las celdas
que el CRM no tiene marcadas en amarillo **"COMPLETAR"**. El vendedor
completa esas celdas en el mismo correo y lo reenvía.

No es 100% automático, pero le ahorra re-escribir cliente, RUT, obra,
dirección, contacto, equipos, valores, etc.

## Qué se llena solo y de dónde sale

Revisado con la cotización real COT-REN-5288 (CONSTRUCTORA WPF, Cerrada
Ganada 16-10-2026).

| Fila del cuadro | ¿Automático? | De dónde sale | Ejemplo COT-REN-5288 |
|---|---|---|---|
| NUMERO DE DESPACHO | ❌ completar | No existe en CRM | — |
| CLIENTE | ✅ | Cotización → Nombre de Cliente | CONSTRUCTORA WPF LTDA |
| RUT | ✅ | Cliente → RUT | 76981783-2 |
| FECHA DE DESPACHO (AM o PM) / RETIRO | ❌ completar | No existe en CRM | — |
| RETIRA CLIENTE | ✅ si hay Método de Envío | Cotización → Método de Envío ("Retiro…" = SÍ, "Envío…" = NO) | NO (Envío por pagar en recepción) |
| NOMBRE DE QUIEN RETIRA | ❌ completar | — | — |
| PATENTE CAMIÓN RETIRA | ❌ completar | — | — |
| N° ORDEN DE COMPRA = CERRADA / ABIERTA | ⚠️ parcial | Cotización → Orden de Compra (casi siempre vacío). El vendedor marca si es cerrada o abierta | — |
| CON ESTADO DE PAGO / CON ORDEN Y EDP | ❌ completar | — | — |
| NUMERO COTIZACIÓN | ✅ | Cotización → Asunto | COT-REN-5288 |
| NOMBRE DE LA OBRA | ✅ | Obra Rental → Nombre de Obra | ALTO DURAN V |
| DIRECCIÓN DE OBRA | ✅ | Obra Rental → Dirección + Comuna (si no hay obra: Dirección de Despacho de la cotización) | Avenida Luis Durand N°05020, Temuco |
| CONTACTO | ✅ | Cotización → Contacto | MANUEL NAVARRETE |
| TELÉFONO | ✅ | Contacto → Móvil (o Teléfono) | 976191312 |
| MERCADO/EVENTO | ⚠️ parcial | Oportunidad → Ámbito (si está lleno) | — |
| EQUIPO CANTIDAD | ✅ | Productos de la cotización (sin traslados) → nombre x cantidad | ARR. PLATAFORMA ARTICULADA 16 MTRS. DIESEL 4X2 x 1 |
| DÍAS ARRIENDO MÍNIMO | ✅ | Productos → Cant. Días | 7 |
| CON SEGURO UF / SIN SEGURO | ✅ | Productos → Precio Diario Seguro (si tiene valor = con seguro; si no = SIN SEGURO X) | SIN SEGURO: X |
| VALOR ARRIENDO DIARIO | ✅ | Productos → Precio unitario con descuento | $70.000 |
| VALOR HORA EXTRA | ❌ completar | — | — |
| VALOR FLETE | ✅ | Suma de productos "TRASLADO"/"FLETE" | $236.000 |
| SUBARRIENDO (código proveedor, código Emaresa, horómetro de salida) | ❌ completar | — | — |
| FACILITY SERVICE, PROVISIONES, C. DAÑOS, COBRO H.AD., EQUIPO ROBADO, FACTURA RECLAMADA | ❌ completar | — | — |
| María Paz Habilitado (SI-NO) / JEFE ZONA Aprobado (SI-NO) | ❌ completar | — | — |

Resultado: **~14 de 31 filas llegan llenas** (todas las de datos del
cliente, obra, equipo y valores); el vendedor solo completa lo operativo.

## Cómo se arma en Zoho (2 piezas)

### 1. Función `enviarCuadroDespachoRental`

Configuración → Desarrollador → Funciones → Nueva función (categoría
Automatización / Flujo de trabajo), módulo **Cotizaciones**.
Argumento: `quoteId` = Cotizaciones → **ID de Cotización**.

```deluge
void automation.enviarCuadroDespachoRental(Int quoteId)
{
	cot = zoho.crm.getRecordById("Quotes",quoteId);
	completar = "<span style='color:#9c6500;font-weight:bold;'>COMPLETAR</span>";
	// ---------- Cliente / RUT ----------
	clienteNombre = "";
	rut = "";
	if(cot.get("Account_Name") != null)
	{
		clienteNombre = cot.get("Account_Name").get("name");
		cuenta = zoho.crm.getRecordById("Accounts",cot.get("Account_Name").get("id").toLong());
		rut = ifnull(cuenta.get("RUT"),"");
	}
	// ---------- Obra ----------
	nombreObra = "";
	dirObra = "";
	if(cot.get("Obra_Rental") != null)
	{
		obra = zoho.crm.getRecordById("Obras_Rental",cot.get("Obra_Rental").get("id").toLong());
		nombreObra = ifnull(obra.get("Nombre_de_Obra"),"");
		dirObra = ifnull(obra.get("Direcci_n_de_Obra"),"");
		if(dirObra != "" && obra.get("Comuna") != null)
		{
			dirObra = dirObra + ", " + obra.get("Comuna");
		}
	}
	if(dirObra == "")
	{
		dirObra = ifnull(cot.get("Calle_de_Despacho"),"");
		if(dirObra != "" && cot.get("Comuna_de_Despacho") != null)
		{
			dirObra = dirObra + ", " + cot.get("Comuna_de_Despacho");
		}
	}
	// ---------- Contacto ----------
	contacto = "";
	fono = "";
	if(cot.get("Contact_Name") != null)
	{
		contacto = cot.get("Contact_Name").get("name");
		con = zoho.crm.getRecordById("Contacts",cot.get("Contact_Name").get("id").toLong());
		fono = ifnull(con.get("Mobile"),ifnull(con.get("Phone"),""));
	}
	// ---------- Mercado (Ámbito de la Oportunidad) ----------
	mercado = ifnull(cot.get("mbito"),"");
	if(mercado == "" && cot.get("Deal_Name") != null)
	{
		opo = zoho.crm.getRecordById("Deals",cot.get("Deal_Name").get("id").toLong());
		mercado = ifnull(opo.get("mbito"),"");
	}
	// ---------- Retira cliente ----------
	metodo = ifnull(cot.get("M_todo_de_Env_o"),"");
	retira = "";
	if(metodo.contains("Retiro"))
	{
		retira = "SÍ (" + metodo + ")";
	}
	else if(metodo.contains("Envío"))
	{
		retira = "NO (" + metodo + ")";
	}
	// ---------- OC ----------
	oc = ifnull(cot.get("Orden_de_Compra"),"");
	if(oc != "")
	{
		oc = oc + " (confirmar si es cerrada o abierta)";
	}
	// ---------- Productos ----------
	equipos = "";
	dias = "";
	valorDiario = "";
	conSeguro = "";
	flete = 0;
	for each it in ifnull(cot.get("Quoted_Items"),List())
	{
		prod = it.get("Product_Name").get("name");
		if(prod.containsIgnoreCase("TRASLADO") || prod.containsIgnoreCase("FLETE"))
		{
			flete = flete + ifnull(it.get("Net_Total"),0);
		}
		else
		{
			sep = if(equipos == "","","<br>");
			equipos = equipos + sep + prod + " x " + it.get("Quantity");
			dias = dias + sep + ifnull(it.get("Cant_D_as"),"");
			valorDiario = valorDiario + sep + "$" + ifnull(it.get("Precio_Unitario_con_Descuento"),it.get("List_Price"));
			seguro = ifnull(it.get("Precio_Diario_Seguro"),0);
			if(seguro > 0)
			{
				conSeguro = conSeguro + if(conSeguro == "","","<br>") + seguro;
			}
		}
	}
	sinSeguro = if(equipos != "" && conSeguro == "","X","");
	valorFlete = if(flete > 0,"$" + flete,"");
	// ---------- Armar el cuadro ----------
	// Cada fila: etiqueta | valor | color de fondo de la etiqueta
	filas = List();
	filas.add({"t":"DATOS DE DESPACHO / RETIRO","h":"#3a3a3a"});
	filas.add({"l":"NUMERO DE DESPACHO","v":""});
	filas.add({"l":"CLIENTE","v":clienteNombre});
	filas.add({"l":"RUT","v":rut});
	filas.add({"l":"FECHA DE DESPACHO (AM O PM) / O RETIRO","v":""});
	filas.add({"l":"RETIRA CLIENTE","v":retira,"c":"#c9d6a3"});
	filas.add({"l":"NOMBRE DE QUIEN RETIRA","v":""});
	filas.add({"l":"PATENTE CAMION RETIRA","v":""});
	filas.add({"l":"N° ORDEN DE COMPRA = CERRADA","v":oc});
	filas.add({"l":"N° ORDEN COMPRA = ABIERTA","v":""});
	filas.add({"l":"CON ESTADO DE PAGO","v":""});
	filas.add({"l":"CON ORDEN Y EDP","v":""});
	filas.add({"l":"NUMERO COTIZACIÓN","v":cot.get("Subject")});
	filas.add({"l":"NOMBRE DE LA OBRA","v":nombreObra});
	filas.add({"l":"DIRECCION DE OBRA","v":dirObra});
	filas.add({"l":"CONTACTO","v":contacto});
	filas.add({"l":"TELEFONO","v":fono});
	filas.add({"l":"MERCADO/EVENTO","v":mercado});
	filas.add({"l":"EQUIPO CANTIDAD","v":equipos});
	filas.add({"l":"DIAS ARRIENDO MINIMO","v":dias});
	filas.add({"l":"CON SEGURO UF","v":conSeguro});
	filas.add({"l":"SIN SEGURO","v":sinSeguro});
	filas.add({"l":"VALOR ARRIENDO DIARIO","v":valorDiario});
	filas.add({"l":"VALOR HORA EXTRA","v":""});
	filas.add({"l":"VALOR FLETE","v":valorFlete});
	filas.add({"t":"SUBARRIENDO","h":"#2f5f7f"});
	filas.add({"l":"SUBARRIENDO CODIGO PROVEEDOR","v":"","c":"#cfe0ec"});
	filas.add({"l":"SUBARRIENDO CODIGO EMARESA","v":"","c":"#cfe0ec"});
	filas.add({"l":"HOROMETRO DE SALIDA","v":"","c":"#cfe0ec"});
	filas.add({"l":"FACILITY SERVICE","v":"","c":"#d9cbc4"});
	filas.add({"l":"PROVISIONES","v":"","c":"#ecd9a6"});
	filas.add({"l":"C. DAÑOS","v":"","c":"#ecd9a6"});
	filas.add({"l":"COBRO H.AD.","v":"","c":"#ecd9a6"});
	filas.add({"l":"EQUIPO ROBADO","v":"","c":"#ecd9a6"});
	filas.add({"l":"FACTURA RECLAMADA","v":"","c":"#ecd9a6"});
	filas.add({"l":"Maria Paz Habilitado (SI-NO)","v":""});
	filas.add({"l":"JEFE ZONA Aprobado (SI-NO)","v":""});
	td = "border:1px solid #888;padding:4px 8px;font-family:Arial;font-size:12px;";
	tabla = "<table style='border-collapse:collapse;width:600px;'>";
	for each f in filas
	{
		if(f.containKey("t"))
		{
			tabla = tabla + "<tr><td colspan='2' style='" + td + "background:" + f.get("h") + ";color:#fff;font-weight:bold;text-align:center;'>" + f.get("t") + "</td></tr>";
		}
		else
		{
			fondo = ifnull(f.get("c"),"#f2f2f2");
			valor = f.get("v").toString();
			if(valor == "")
			{
				celda = "<td style='" + td + "background:#fff2b3;'>" + completar + "</td>";
			}
			else
			{
				celda = "<td style='" + td + "background:#ffffff;'>" + valor + "</td>";
			}
			tabla = tabla + "<tr><td style='" + td + "background:" + fondo + ";font-weight:bold;width:45%;'>" + f.get("l") + "</td>" + celda + "</tr>";
		}
	}
	tabla = tabla + "</table>";
	cuerpo = "<p>Hola " + cot.get("Owner").get("name") + ",</p>";
	cuerpo = cuerpo + "<p>La cotización <b>" + cot.get("Subject") + "</b> quedó <b>Cerrada Ganada</b>. Este es el cuadro de despacho con los datos que ya están en el CRM.</p>";
	cuerpo = cuerpo + "<p>Completa las celdas en <span style='background:#fff2b3;'>amarillo</span> y reenvía este correo para coordinar el despacho.</p>";
	cuerpo = cuerpo + tabla;
	sendmail
	[
		from :zoho.adminuserid
		to :cot.get("Owner").get("email")
		subject :"Cuadro de despacho - " + cot.get("Subject") + " - " + clienteNombre
		message :cuerpo
	]
}
```

### 2. Regla de flujo "SB Cuadro Despacho Rental" (módulo Cotizaciones)

- Cuándo: **Crear o editar**, **sin** "Repetir".
- Condición: **Fase de Cotización = Cerrada Ganada** Y **UN = Rental**.
- Acción: Función → `enviarCuadroDespachoRental` (quoteId = ID de Cotización).

## Pruebas (Sandbox)

1. Cotización Rental de prueba con Obra, Contacto, un equipo y un
   "TRASLADO MAQUINARIA" → pasarla a Cerrada Ganada → debe llegar el
   correo al propietario con cliente, RUT, obra, equipo, días, valor diario
   y flete llenos.
2. Cotización sin Obra → la dirección debe salir de "Calle de Despacho".
3. Cotización de otra UN → no debe llegar nada.

## Preguntas abiertas para Simón

1. **¿A quién se reenvía el cuadro?** (logística / despacho / jefe de zona).
   Si es siempre el mismo correo, se puede poner en copia directo y el
   vendedor solo responde a todos con lo completado.
2. **¿Cuándo debe llegar?** Propuesto: al pasar a Cerrada Ganada. Alternativa:
   al Confirmar Envío (antes de ganar).
3. **"CON SEGURO UF"**: en la cotización el seguro está como "Precio Diario
   Seguro" (en pesos). ¿Sirve ese valor o el cuadro necesita el valor en UF?
4. En Cotizaciones existe un campo **"Cuadro digitable"** (creado el
   29-09-2026, casi siempre vacío; en COT-REN-5287 tiene "HOSPITAL OHLA
   LOTA"). ¿Alguien empezó algo parecido con ese campo? Si no se usa, se
   podría aprovechar para guardar ahí una copia del cuadro.
