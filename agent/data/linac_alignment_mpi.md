# PURPOSE

This document describes the procedure for aligning the LINAC and collimation system for the RefleXion Medical Radiotherapy System.

# SCOPE

This procedure pertains to the manufacture build of the RefleXion Medical Radiotherapy System.

# REFERENCE DOCUMENTS

## 740-00338-00 SYSTEM, ALIGNMENT, LINAC

## 775-00026 Fixture and Equipment Control (CAL/PM) SOP

## 785-00009 Training Document, Taking MVD Images

# DEFINITIONS

## Symbol Legend:

***:*** *Apply Loctite of type (e.g. Apply Loctite 243)*

243

***:*** *Torque Screw to value (e.g. Torque screw to 7.6 Nm)*

7.6 Nm

## Concepts

|  |  |
| --- | --- |
| **Term** | **Description** |
| Test Set # | Test Set # is used to track a set of tests completed at a configuration. This number increments when tests are repeated, not when the configuration changes. |
| Configuration | Configurations are the set of adjustments made to the system relative to the initial configuration. The initial configuration starts off at 0 for all adjustments. Configurations consists of [X Offset, MLC Shim, Y Offset, Jaw Encoder]. |
| Adjustment | Adjustments are the changes which can be made to the system as part of LINAC Alignment. |
| Tests | Tests are the conducted to evaluate the alignment of the system and have pass fail specifications. |
| X Tests | X Tests, [X Symmetry, OOF, Star Shot], are affected by X Measurements, [X Offset, MLC Shim]. |
| Y Tests | Y Tests, [Y Symmetry, Jaw Sweep, Jaw Divergence] are affected by Y Measurements, [Y Offset, Jaw Encoder]. |

## Adjustments

|  |  |
| --- | --- |
| **Term** | **Description** |
| X Offset / Y Offset | LINAC offset in the IEC X/Y axis relative to the original position in inches. Gauge pins have precision down to a thousandth of an inch. |
| MLC Shim | Thickness of shim under MLC in inches. +/- sign indicates which side on the IEC x axis the shim would be under at 0 deg. NOTE: The gantry is at 180 deg when the shim is installed, this flips the coordinate system. |
| Jaw Encoder | Total Jaw Encoder offset in counts. Difference in encoder count from the original front jaw encoder counts. Inverse for back jaw encoder counts. |

## Tests and Measurements

|  |  |
| --- | --- |
| **Term** | **Description** |
| X Symmetry / Y Symmetry | TomoDose X/Y Area Symmetry for in %. The TomoDose should be aligned to the system X/Y axes. Symmetry is measured with beam center at 0, 0. |
| OOF | TG148 Directional OOF in %. Tongue and Groove Out of Focus. OOF should be measured with gantry at 0 deg. |
| Star Shot | Star Shot. Minimum tangent radius in mm. +/- sign indicates which direction on the x axis the beam is offset towards at 0 deg. |
| Jaw Sweep | Source Offset in mm. Recorded in worksheet after sweeping through all encoder positions. |
| Jaw Divergence | Mean Jaw Offset Projected to Isocenter in mm. |

# RESPONSIBILITIES

## NPI/Manufacturing Engineer is responsible for managing this document and ensuring proper tracing of all parts that are installed onto the Device in the DHR.

## NPI/Manufacturing Tech is responsible for following these procedures to build and document the system.

## NPI/Manufacturing Engineer is responsible for assisting the build where necessary.

# GENERAL REQUIREMENTS

## Equipment/Parts

## See routing for the assy being built on this WO

|  |  |  |
| --- | --- | --- |
| **P/N** | **Description** | **Calibration Required**  **(Y/N)** |
| 570-00056 | SOFTWARE, OOF TG 148 Tongue and Groove Analysis V1.1.1.2 | N |
| 610-00084 | Ion Chamber, Exradin A17 | Y |
| 610-00718 | Buildup Cap, Ion Chamber Exradin A17 | N |
| 610-00075 | Test Equipment, Electrometer, Standard Imaging SuperMAX | Y |
| 610-00086 | Radiotherapy film, Gafchromic, EBT3, 8" x 10" | N |
| 610-00087 | Kit, Phantom, Standard Imaging, Virtual Water | N |
| 630-00001 | Epson 12000XL film scanner | N |
| 610-00434 | FIXTURE, ALIGNMENT ADAPTER PLATE LINAC | N |
| 610-00415 | Virtual Water Slit Beam 5mm | N |
| 525-00001 | Epson Scan 2 scanner software | N |
| 525-00010 | RIT Analysis Software | N |
| 535-00038 | Worksheet, Jaw Centering | N |
| 535-00052 | Worksheet, LINAC Alignment Test Table | N |
| 570-00183 | LINAC Alignment Contour Plot Tool v1.1.1.10 | N |
| 470-00727 | DIGITAL LEVEL, 2-AXIS | Y |
| 610-00521 | Torque Wrench, EPT100i, 1/4" Drive, 2.8 - 11.9 Nm | Y |
| 610-00523 | Micrometer Torque Wrench, 3/8 in Drive Size, 30 to 250 In. lb. Model 2502MRMH | Y |
| 610-00527 | Torque Wrench, 5-75 ft. lb. 752MFRMH | Y |
| 610-00549 | Adjustable Torque Screwdriver, Model QSA 50 FH | Y |

## Risks/Warnings

### Components are very heavy-Use caution and any lifting devices applicable

### Lead components – use proper PPE to handle lead components

### Fiberglass components can cause skin irritation – use proper PPE to deal with fiberglass components

### When the beehive is removed, there is less radiation shielding from the LINAC. Do not beam on with full energy. Set RF trigger frequency to 10 Hz, DO NO EXCEED 50 Hz.

# PROCEDURE

LINAC Alignment Setup

### MVD Calibration File Setup

![A label on a metal surface  AI-generated content may be incorrect.](data:image/png;base64...)

Figure : Example MVD label

#### Locate the MVD inside the gantry. Record the workorder and reference number

#### Transferring files may require creating and changing the permissions of the “images/calibration” folder on the kVCT RxEC. From the gateway run the following commands if needed:

rxm@rxm-gateway-s#:~$ **ssh 192.168.10.106**

192.168.10.106:/home/rxm# **cd images**

192.168.10.106:/home/rxm/images# **mkdir calibration**

192.168.10.106:/home/rxm/images# **chmod a+w calibration**

#### Locate the calibration files folder from “R:\Cross-Functional\MFG\MVD Calibration\[MVD W/O Number]\_[MVD Ref Number]”.

1. If multiple image gains are available, use gain 6. Reference number in folder name may slightly differ from label.

#### Copy the set of folders in the “CalibrationOf” folder to “~/images/calibration” on the gateway computer. The folder structure should be “~/images/calibration/[image mode]”.

### On RFNode, disable the following interlocks:

1. These interlocks should be disabled again after restarting RFNode. Disable these interlocks as necessary throughout this procedure.

|  |  |
| --- | --- |
| **InterlockID** | **Description** |
| 191617 | DoseChamber.ChamberRatioOutOfRange |
| 191619 | DoseChamber.SymmetryX |
| 191620 | DoseChamber.SymmetryY |
| 191621 | DoseChamber.FlatnessX |
| 191622 | DoseChamber.ChargePerPulseLow |
| 191623 | DoseChamber.ChargePerPulseHigh |
| 191624 | DoseChamber.Dose2Limit |
| 191626 | DoseChamber.Dose1Dose2Deviation |
| 191627 | DoseChamber.DoseDeviation |

Table : RFNode dose chamber interlocks to disable

TG148 OOF

1. See 785-00009 Training Document, Taking MVD Images for more information on taking MVD images.

### On **RfNode** tab, set trigger mode to “DCC\_testUI”

### On **GantryNode** tab, home gantry and set gantry angle to 0 degrees. Confirm angle from TDS and gantry node match.

### On **DeliveryNode** tab, set MLC leaves to “All leaves” under “Predefined Leaf Masks”. Set jaws to 2 cm using “Move” under “Jaw Front 2 cm” and “Jaw Back 2 cm”. This will be the open field.

![A screenshot of a computer  Description automatically generated](data:image/png;base64...)

Figure . Dosimetry node parameters for taking an MVD image

### On **DosimetryNode**, set the following parameters:

|  |  |
| --- | --- |
| Image mode | hires |
| Trigger mode | ext |
| Detector gain | 6 |
| Max num images | 12 |
| Num average images | 10 |
| Gain correction | TRUE |
| Offset correction | TRUE |
| Bad pixel correction | TRUE |
| Software 2x2 | FALSE |
| Save images | TRUE |
| Average image | TRUE |
| Publish profiles only | FALSE |
| Publish images | FALSE |

### On **DosimetryNode**, select “Prepare Imaging”. Verify Gain correction or Bad pixel correction remain selected.

1. If Gain and Bad pixel correction automatically deselect after clicking “Prepare Imaging”, there may be an issue with the MVD calibration files.

### On **DosimetryNode** tab, select “Update Offset” and wait for “Received images” to stop incrementing. Received images should be > 100.

### On **RfNode**, close BEL and beam on.

![A screenshot of a device  Description automatically generated](data:image/png;base64...)

Figure : Adjusting MVD image acquisition rate.

### On **DosimetryNode**, ensure that “mvdRate” in the bottom left is 10 Hz. Select “Start Imaging” to begin collecting MVD images.

### Open “terminal” from “Tools Launcher” and run the following command from Servicebase (replacing the date in blue text with the current date):

#### rsync -av 192.168.20.100:~/images/2021\_06\_11 ~/images

### Click on the link at the bottom of the dosimetry node and scroll to the end to see the average image. Verify open leaf 2 cm MVD image appears as shown below in Figure.

1. The first two images may contain image artifacts and are automatically excluded from the average image. Repeat image collection if image artifacts are noticed. Contact a MFG engineer if MVD images appear unusual.

![A white rectangular object with red text  Description automatically generated](data:image/png;base64...)

![A black background with white lines  Description automatically generated](data:image/png;base64...)

![A black background with white lines  Description automatically generated](data:image/png;base64...)

Figure . Expected results for open, even and odd leaf images

### Acquire MVD image with jaw at 2 cm and leaf setting “Even leaves”. Verify even leaf 2 cm MVD image appears as indicated in Figure. Record timestamp in traveler.

### Acquire MVD image with jaw at 2 cm and leaf setting “Odd leaves”. Verify odd leaf 2 cm MVD image appears as indicated in Figure. Record timestamp in traveler.

### On the Tools Launcher, select Tongue and Groove script and load the corresponding “hires\_avg\_0001\_00010.mvd “ file for each field.

1. If the version of Tongue and Groove script in Tools Launcher does not match the version in the routing, transfer MVD images to a MFG laptop and download the most up to date Tongue and Groove script

### Record the “OOF percent directional” (under “TG148 OOF Calculation”). Save a screenshot of figures and the results.

1. High values of “symmetry, point-by-point” (>1) may indicate MVD Image issues.

### Save the MVD images and screenshot of results in the MFG R drive under R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]

Jaw Divergence

### Setup (Jaw Divergence)

#### Reference 790-00078 WI, Film Scanning and Importing for best practices when using film.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| **Test** | **Film Type** | **Film Dims (in)** | **Buildup (mm)** | **Backscatter (mm)** | **Wait Time (hr)** | **H.Laser Align** |
| Y-Jaw Twist & Beam Divergence | EBT3 | 8x2.5 | 15 | 5 | 0 | Film 21 cm below laser |

#### Cut the radiographic film into a rectangle of approximately 8x2.5 in.

#### Align the film surface to the horizontal lasers to within 0.5mm of isocenter.

#### Place and center the film on the couch with 5 mm of backscatter and 15 mm of buildup. Draw a small dot (called a “pinhole”) to indicate the center of the film on the y+ side (towards the bore) using a sharpie.

#### Lower the couch to 21 cm below isocenter along IEC-Z by using the couch controls.

#### Move the gantry to 0 degrees.

#### Move the couch 1000mm in the Y+ direction.

1. Laser isocenter is not calibrated and may not be 1000 mm away from the mechanical isocenter. Adjust couch y position if needed.

### Data Collection (Jaw Divergence)

#### Open one side of the MLC leaves (leaves 0-31[0xffffffff]) using the delivery node, and set the jaw size to 1 cm.

#### Deliver 12000 triggers with the RF Node.

#### Rotate the gantry to 180 degrees without moving MLC leaves or jaw using the Gantry node.

#### Deliver 6000 triggers with the RF Node.

#### Enter the bunker and inspect the film on the couch to determine if it was exposed correctly by the appearance of distinct optical density between the two sides, Figure 5. Inspect for and record any gross misalignments/MLC failures/other notable errors.

![A close-up of a pen  Description automatically generated with low confidence](data:image/png;base64...)

Figure 5: Y-Jaw Twist & Beam Divergence film pattern

### Analysis (Jaw Divergence)

#### For this test, it is not necessary to wait for the film to develop before scanning.

#### Remove the film from the couch. Scan and import the film to RIT, referencing 790-00078 WI, Film Scanning and Importing for guidance.

#### In RIT Complete, select Machine QA > TG148 > Beam Planarity and Jaw Twist.

![Graphical user interface, text, application  Description automatically generated](data:image/png;base64...)

Figure : Selecting Beam Planarity and Jaw Twist

#### When adjusting the ROI (region of interest) ensure that the pinhole is still visible. If it is missing an error may occur and the +/- signs of the results may be incorrect.

#### Adjust “Film Setup Distance (cm) to Isocenter (IEC Z)” to be 21 cm.

#### In the settings, ensure that “Measurement Area (pixels)” is 100 and “Measurement Offset (mm)” is 0.

#### Click “Analyze Image”

![Graphical user interface  Description automatically generated](data:image/png;base64...)

Figure : Settings for Beam Planarity Test

#### Record “Mean Jaw Offset Projected to Isocenter (IECY) and “Jaw Twist Angle”

![Graphical user interface, application, PowerPoint  Description automatically generated](data:image/png;base64...)

Figure : Example of Beam Planarity Test results

#### Save the scanned film and the RIT report in the MFG shared drive under R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]

Starshot

### Setup (Starshot)

#### Reference 790-00078 WI, Film Scanning and Importing for best practices when using film.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| **Test** | **Film Type** | **Film Dims (in)** | **Buildup (mm)** | **Backscatter (mm)** | **Wait Time (hr)** | **H.Laser Align** |
| Star Shot | EBT3 | 8x10 | N/A | N/A | 0 | Film vertical center |

#### Tape a full sheet of radiographic film on to a 50 mm solid water block as shown. Mark the film to ensure that the direction of error can be calculated if necessary.

##### Mark the top of the film edge with the word “Top”

##### Mark the film with “+X” on the IEC +X side

##### Mark the film with “-X” on the IEC -X side

![A picture containing indoor  Description automatically generated](data:image/jpeg;base64...)![A picture containing text, outdoor, red, sign  Description automatically generated](data:image/png;base64...)

IEC +X

IEC -X

Figure . Radiographic film sandwiched between solid water blocks and star shot result

#### Align the bore laser to be in the center of the taped film

#### Align the vertical component of the side lasers to the film +/- 0.5 mm

#### Sandwich the film with another 50 mm virtual water slab

#### Move the couch 1000 mm in Y+ to the MV beam plane

### Data Collection (Starshot)

#### On DeliveryNode, Set the jaw size to 2cm, and select middle two MLC leaves open (leaves 31 and 32).

#### On RfNode set trigger mode to RF\_FPGA and trigger frequency 50 hz.

#### Deliver 450 MU at the following gantry angles: 0°, 72°, 144°, 216° and 288°

#### Inspect film to verify that it was exposed correctly based on the appearance of five intersecting lines forming a star pattern in the center.

#### Remove film from couch and label with system name, operator initials and date

Expected Results:

Film should have an exposure pattern like Figure 10.

![A picture containing text  Description automatically generated](data:image/png;base64...)

Figure 10: Starshot Pattern

### Analysis (Starshot)

#### For this test, it is not necessary to wait for the film to develop before scanning.

#### Remove the film from the couch. Scan and import the film to RIT, referencing 790-00078 WI, Film Scanning and Importing for guidance.

#### In RIT Complete, select Machine QA > TG142 > Star Shot Analysis.

![Graphical user interface, application  Description automatically generated](data:image/png;base64...)

Figure : Selecting Star Shot Analysis

#### When prompted, use “EBTx 48-bit TIFF” as the calibration file. This is a default calibration applied by RIT when no calibration is selected.

![Graphical user interface, application  Description automatically generated](data:image/png;base64...)

Figure : Pop up selecting film type when no calibration is initially applied.

#### Select a ROI (region of interest) that is approximately 15 cm x 15 cm at the center of the pattern.

![Radar chart  Description automatically generated](data:image/png;base64...)![Graphical user interface, application  Description automatically generated](data:image/png;base64...)

Figure : 15 cm x 15 cm ROI on Star Shot

#### “Ensure Number of Legs (2 x # Beams)” is 10. If needed adjust “Threshold (10%-30%)” until image is analyzed.

![Graphical user interface, text, application, email  Description automatically generated](data:image/png;base64...)

Figure : Star Shot parameters

#### Record the “Minimum Tangent Circle Radius (TG142)” and save the export the report to PDF. The +/- sign of Star Shot determines which direction the beam is offset along the X axis. For example, if the right side of the film is in the -X direction and the vertical line is to the right of the Star Shot center, then Star Shot is negative (and vice versa).

![Graphical user interface  Description automatically generated](data:image/png;base64...)

Figure : Star Shot example results

#### Scan the film and analyze the film in RIT software to find the radius of the radiation isocenter.

#### Save image and analysis report in the MFG shared drive under R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]

#### If Star Shot is unable to be analyzed, contact a MFG engineer and repeat Star Shot. Save both the original and new image.

TomoDose Symmetry

### Set up the TomoDose (610-00113) on the couch. Level the TomoDose along X and Y within +/- 0.05 deg using DIGITAL LEVEL, 2-AXIS (470-00727).

1. For X, use the average of the left side to the right side of the TomoDose. For Y, just take a value in the middle.

### Add 5 mm of solid water and align top of solid water to horizontal portion of the bore laser.

### Connect the TomoDose and collect the background measurement. Select the calibration file corresponding to the TomoDose EFT number.

### Move the gantry to 0 degrees

### Move the couch 1000mm in the +Y direction.

### Set MLC to all leaves open and jaw size to 2 cm.

### Turn on X-ray beam at 10 Hz and Rf\_FPGA trigger mode. (DO NOT EXCEED 10 Hz trigger frequency if beehive is removed). If beehive is installed trigger frequency can be set to 50 Hz.

![A screenshot of a computer  AI-generated content may be incorrect.](data:image/png;base64...)

Figure : TomoDose results example

### Adjust the couch in X and Y until “Beam Center” on TomoDose is 0.00 cm for X and Y.

### Ensure beam is warmed up before taking data by running the beam for 3 minutes. (This can include time used to find beam center)

### Take measurement of at least 2000 pulses and save the measurement files as “[X distance from starting position] [y distance from starting position] [system name] [date]”. Record the Area Symmetry for X and the Area Symmetry for Y.

### Save the TomoDose file in the MFG shared drive under R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]

Jaw Sweep

### Attach Exradin A17 ion chamber (610-00084) with buildup cap (610‑00718) to couch top using tape at the laser isocenter within +/- 1 mm ensuring the top of the ion chamber is pointing towards the bore laser.

### Connect Exradin A17 to the electrometer. Turn on the electrometer. Set the bias voltage to -300 V, set to “LOW” range and zero the channel readings.

### Set the electrometer to “Timed Collection”, “Repeating 10 secs”, and “3 Collections”.

### Move gantry to 0 degrees

### Open all MLC leaves

### On **DeliveryNode**, on the Jaw subtab, set the Jaw Sweep Gap to 2mm and press the “Move” button next to 0 mm

### Turn on X-ray beam at 10 Hz and Rf\_FPGA trigger mode. (DO NOT EXCEED 10 Hz trigger frequency if beehive is removed). If beehive is installed trigger frequency can be set to 50 Hz.

### Move the couch forward until the reading on the electrometer just starts to spike and then move the couch another 60 mm. Record the couch position.

60 mm

Figure : Ion chamber charge for each couch position. Actual positions for each system will vary.

### Press the “Move” button next to -14 mm.

### Turn on X-ray beam at 10 Hz and Rf\_FPGA trigger mode. (DO NOT EXCEED 10 Hz) If beehive is installed frequency can be set to 50 Hz.

### Set the electrometer to capture 10 seconds with 3 collections and record the electrometer reading. Navigate to “Data” tab and then select “Charge” to view a history of the readings.

### Repeat measurement for each of the remaining 14 jaw positions: -12 mm, -10 mm, -8 mm, -6 mm, -4 mm, -2 mm, 0 mm, 2 mm, 4 mm, 6 mm, 8 mm, 10 mm, 12 mm, and 14 mm. Record the 3 readings at each position in the worksheet (535-00038-00) and then turn off the beam.

### Record the value of “source offset, mm” from the worksheet (535-00038-00).

### Save the worksheet in the MFG shared drive under R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]

Evaluate Exit Criteria

### Evaluate if the current configuration meets the following exit criteria for LINAC alignment:

1. The exit criteria for this MPI is narrower than the product specification for these measurements.

|  |  |  |
| --- | --- | --- |
| **Measurement** | **Target Specification (Exit Criteria)** | **Product Specifications** |
| Average TomoDose X Symmetry | +/- 1.0% | +/- 2.0 % |
| TG148 Out of Focus Factor (OOF) | +/- 1.90% at 0 degrees | +/- 2.0 % at 0 degrees |
| Starshot | +/- 0.50 mm | +/- 1.0 mm |
| Average TomoDose Y Symmetry | +/- 1.0% | +/- 2.0 % |
| Jaw Sweep Source Offset (mm) | +/- 0.1 mm | +/- 0.3 mm |
| Jaw Divergence | +/- 0.45 mm | +/- 0.5 mm |

### Record results in 535-00052-00, Worksheet, LINAC Alignment Test Table.

#### In “LINAC Alignment Test Table”, record the configuration and X/Y Tests for the current Test Set #. Test Set # begins at 1 and increments when X/Y Tests are re-taken. The initial configuration is 0 for all adjustments and is changed during iteration.

#### In “Alignment Sequence”, record the sequence in which each Adjustment/Test was performed for each Test Set #. Adjustments are associated with the Test Set # of the new configuration. Each MPI section, including lead stacking/unstacking, should be recorded (ex. 7.9, 7.10, 7.11, 7.12, 7.13).

### If the current configuration meets the exit criteria, LINAC Alignment is complete. Cross out unused sections in the traveler and save all data.

#### Verify brackets are secured. Verify beehive is installed and torqued.

#### Ensure all MVD images taken during the process are stored in “R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]”

#### Ensure all raw film scans and RIT reports are stored in “R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]”

### If the current configuration does not meet the exit criteria, the system is not aligned and requires iteration. Record and track iterations in 535-00052-00, Worksheet, LINAC Alignment Test Table. Print and attach additional sheets for the iterations in traveler. X/Y Offset, MLC Shim, and Jaw Encoder adjustments can be completed in any order.

#### Generate contour plots by completing section 7.8.

#### If needed, apply X/Y Offset adjustments by completing section 7.9 - 7.13.

#### If needed, apply MLC Shim adjustments by completing section 7.14.

#### If needed apply Jaw Encoder adjustments by completing section 7.15.

#### Repeat LINAC Alignment Tests, section 7.2 - 7.6. Tests can be completed in any order. X Tests may be skipped when only iterating on Y Tests and vice versa; however, all tests at the configuration must be completed to pass the exit criteria.

#### Re-evaluate exit criteria by repeating section 7.7.

Generate Contour Plot

### Open 570-00183 LINAC Alignment Contour Plot Tool. Reference 790-00093 WI, Using LINAC Alignment Contour Plot Tool for instructions on how to use the tool.

![Graphical user interface  Description automatically generated with low confidence](data:image/png;base64...)

Figure : LINAC Alignment Contour Plot UI

### Enter the test results collected for the current configuration into Contour Inputs.

### Click Generate Contour Plots

### The predicted adjustments needed to achieve optimal alignment are displayed under Contour Minimum Label. All adjustments are relative to the configuration used for the Contour Inputs. Record these values as the recommended adjustments.

### The recommended adjustments are predictions that may not account for ease of adjustment and physical limitations (ex. MLC Shim size may not be available; Jaw Encoder adjustments may reach maximum). X/Y Offsets should be preferred over high MLC Shim or Jaw Encoder changes. Other points on the Contour Plot may meet the exit criteria and can be used instead of the recommended adjustments. Record the intended adjustments which will be made.

### Record the intended configuration after the actual adjustments.

### Save the results by using the Save all Data button on the Coefficient Tab. Name the file “Test Set [#] Contour Plot”. Save the JSON file to “R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]”

Beehive Removal and Bracket Loosening

### On the System UI set the system to idle. Turn off all breakers on the 220V and 480V panel except for the 220V Always On.

### Pin the gantry at 0 deg and LOTO.

![A machine with pipes and wires  AI-generated content may be incorrect.](data:image/png;base64...)

Figure : LINAC HV cables connecting to gun driver

### Remove zip ties, open Loop Clamp (470-00931), and disconnect LINAC HV cables from E-Gun Driver.

### Disconnect LINAC HV Cable Ground Lug from the 440-01278 GUN DRIVER HV TERMINAL COVER and 440-01096 BRACKET SUPPORT TARGET.

![A drawing of a circular object  Description automatically generated](data:image/png;base64...)

Figure : LINAC ASSY NEST

### Carefully remove all hardware and components to clear ASSY, NEST, BRIDGE, LINAC (P/N 815-00027) off the machine being careful not to bend copper tubes and wearing proper PPE to deal with lead components.

![](data:image/png;base64...)

GUARD SHIELD CONNECTOR ION PUMP

ION PUMP MAGNET SUPPORT BRACKET

Snug-Fit Vibration-Damping Loop

Figure 21. Nest removed and current monitor mounted and zip tied on copper tubes.

### Loosen GUARD SHIELD CONNECTOR ION PUMP (P/N 440-00985) along with Snug-Fit Vibration-Damping Loop (P/N 470-00870) as shown in Figure 21.

### Loosen BRACKET, SUPPORT, LINAC ION PUMP MAGNET (P/N 440-00730) as shown in Figure 21.

### Loosen the 4 screws securing BRACKET SPRT W-GUIDE POWER METER (P/N 440-00099) as shown in Figure 22.

### Loosen the 2 screws securing ADJUSTER PLATE W-GUIDE LINAC (P/N 440-01033) as shown in Figure 22.

![A close up of a machine  AI-generated content may be incorrect.](data:image/png;base64...)

BRACKET SPRT W-GUIDE

4X screw on 440-01033 ADJUSTER PLATE W-GUIDE LINAC

Figure . BRACKET SPRT W-GUIDE and the screws to remove in order to remove it.

## **Apply LINAC Offsets**

### Track position iterations in 535-00052-00, Position Adjustments.

1. Test Set # does not increment with adjustments.

### If not already marked, use a pen to mark the X/Y edges of the LINAC and apply masking tape on either side. This is to ensure repeatable gauge pin measurements and so that gauge pins don’t fall in the gap.

### Measure the gap between LINAC and collar by inserting the largest gauge pin that will fit into the -X and +Y gaps. Record the gauge pin sizes under “Current Position, -X/+Y Pin”.

### Record “Current Position, X/Y Offset”. For the initial test set, this is 0, 0. For subsequent test sets, this is equal to the previous test sets “New Position, X/Y Offset”.

### Record the intended LINAC position change in “Change in Position, X/Y Change”. Use this to calculate the new position.

#### “New Position, X/Y Offset” = “Current Position, X/Y Offset” + “Change in Position, X/Y Change”

#### “New Position, -X Pin” = “Current Position, -X Pin” + “Change in Position, X Change”

#### “New Position, +Y Pin” = “Current Position, +Y Pin” - “Change in Position, Y Change”

### Loosen the eight M8 screws holding the LINAC onto the system. Gauge pins must be inserted before loosening the LINAC bolts or else the LINAC may shift unexpectedly.

## ![](data:image/png;base64...)

+X

-X

-Y

+Y

Figure . Mechanical setup for aligning the LINAC with labels indicating IEC coordinates and indications on which screws to loosen.

### Replace the current gauge pins with the new gauge pins calculated in “New Position -X/+Y Pin”. Insert a screwdriver into the gap between the LINAC and collar to move the LINAC as needed.

### Insert a screwdriver into the gap opposite to the gauge pins and gently apply pressure to ensure the LINAC is in contact with the gauge pins.

### Temporarily torque down all eight LINAC bolts to 18.2 Nm. The final torque down performed later.

Confirm Lead Off LINAC Position

### This section is optional. Data is collected as reference to check for unexpected results. Print and attach completed sections in traveler if completed. Record as a Test Set and Lead Off in 535-00052-00, LINAC Alignment Test Table. Turn on breakers on 220V and 480V panels.

1. These tests are performed with lead off. Do not unpin the gantry. Do not exceed 10 Hz trigger rate while lead removed. Jaw Divergence and Star Shot cannot be performed with the lead removed.

### Repeat OOF following section 7.2.

### Repeat Jaw Sweep following section 7.6

### Repeat TomoDose following section 0

Beehive Stacking

### Turn off all breakers on the 220V and 480V panel except for 220V Always On.

18.2 Nm

### Torque down all eight LINAC bolts to 18.2 Nm using 610-00523

### Loosen the 8x M10 bolts securing the ADAPTER, NEST, LINAC plate to the gantry drum

### Remove gauge pins and tape while bolts are loosened.

1. Avoid applying pressure to the LINAC when recentering the adapter plate. Attempt to achieve a loose fit, do not forcefully push the outer ring into the fixture or LINAC.

### Use FIXTURE, ALIGNMENT ADAPTER PLATE LINAC (P/N: 610-00434) to reposition the ADAPTER, NEST, LINAC 440-00141 plate such that the plate is centered about the LINAC adaptor plate.

![A close up of a machine  Description automatically generated](data:image/png;base64...)

Figure : FIXTURE, ALIGNMENT ADAPTER PLATE LINAC (P/N: 610-00434)

### Use a torque wrench to torque 8x SCR, SCH, M10 x 1.5 x40, STL, 12.9 (P/N: 450-00511) 8x WSHR, M10, FENDER, 34MM OD, STL (P/N: 450-00670) and 8x WSHR, NORDLOCK, M10, SST (P/N: 450-00669) screws securing the bridge plate to the gantry to 35 Nm.

35 Nm

1. Threadlocker is not used because screws are secured with lock washers.

### Assemble ASSY, NEST, BRIDGE, LINAC (P/N 815-00027) base tier

#### Ensure that Gantry surface is free and clear

#### First layer: Install 2x 440-00147 BLOCK 1, NEST, LINAC onto the gantry

#### **Verification**: Verify visually that the first layer contains 2x 440-00147 blocks

#### Second layer: Install 2x 440-00148 BLOCK 3, NEST, LINAC

#### **Verification**: Verify visually that the second layer contains 2x 440-00148 blocks

#### Third layer: Install 1x 440-00156 BLOCK 3, NEST, LINAC and 1x 440-00157 BLOCK 4, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the third layer contains 1x 440-00156 and 1x 440-00157 blocks

#### Fourth layer Install 1x 440-00158 BLOCK 5, NEST, LINAC and 1x 440-00161 BLOCK 6, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the fourth layer contains 1x 440-00158 and 1x 440-00161 blocks

|  |  |  |
| --- | --- | --- |
| Item | Part Number | Quantity |
| 1 | 440-00147 BLOCK 1, NEST, LINAC | 2 |
| 2 | 440-00148 BLOCK 2, NEST, LINAC | 2 |
| 3 | 440-00156 BLOCK 3, NEST, LINAC | 1 |
| 4 | 440-00157 BLOCK 4, NEST, LINAC | 1 |
| 5 | 440-00158 BLOCK 5, NEST, LINAC | 1 |
| 6 | 440-00161 BLOCK 6, NEST, LINAC | 1 |
| 29 | 450-00278 SCR, SCH, M14 x 2 x 100, STL, 12.9 | 4 |

![](data:image/png;base64...)![C:\Users\ttan\AppData\Local\Microsoft\Windows\INetCache\Content.Word\IMG_20171116_101232653.jpg](data:image/jpeg;base64...)

6 (back)

5 (front)

3 (right)

4 (left)

2

1

2

1

Figure : Base Tier

90 Nm

#### Ensure that each mounting hole is aligned properly for the base tier. Apply THREADLOCKER, MEDIUM STRENGTH, 243 (P/N: 430-00001) and torque the SCR, SCH, M14 x 2 x 100, STL, 12.9 (P/N: 450-00278) screws to 90 Nm.

243

### Second Tier Assembly

#### Fifth layer: Install 1x 440-00162 BLOCK 7, NEST, LINAC and 1x 440-00163 BLOCK 8, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the fifth layer contains 1x 440-00162 and 1x 440-00163 blocks

#### Sixth layer: Install 1x 440-00162 BLOCK 7, NEST, LINAC and 1x 440-00163 BLOCK 8, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the sixth layer contains 1x 440-00162 and 1x 440-00163 blocks

#### Seventh layer: Install 1x 440-00166 BLOCK 7, NEST, LINAC and 1x 440-00179 BLOCK 8, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the seventh layer contains 1x 440-00166 and 1x 440-00179 blocks

|  |  |  |
| --- | --- | --- |
| Item | Part Number | Quantity |
| 7 | 440-00162 BLOCK 7, NEST, LINAC | 2 |
| 8 | 440-00163 BLOCK 8, NEST, LINAC | 2 |
| 9 | 440-00166 BLOCK 9, NEST, LINAC | 1 |
| 10 | 440-00179 BLOCK 10, NEST, LINAC | 1 |

![](data:image/png;base64...)![C:\Users\ttan\AppData\Local\Microsoft\Windows\INetCache\Content.Word\IMG_20171116_104715766.jpg](data:image/jpeg;base64...)

9 (left)

10 (right)

7 (back)

8 (front)

Figure 26: Second Tier

#### Ensure that each mounting hole is aligned properly for the second tier.

### Third Tier Assembly

#### After completing the Second Tier, proceed to assemble the material as listed on the table below. Note the orientation for all blocks are not interchangeable.

1. ***Caution:*** When working around the cooling tubes, use care when manipulating their positions while moving them into their associated grooves.

#### Eighth layer: Install 1x 440-00181 BLOCK 11, NEST, LINAC and 1x 440-00182 BLOCK 12, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the eighth layer contains 1x 440-00181 and 1x 440-00182 blocks

#### Ninth layer: Install 1x 440-00181 BLOCK 11, NEST, LINAC and 1x 440-00184 BLOCK 13, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the ninth layer contains 1x 440-00181 and 1x 440-00184 blocks

#### Tenth layer: Install 1x 440-00186 BLOCK 14, NEST, LINAC and 1x 440-00188 BLOCK 15, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the tenth layer contains 1x 440-00186 and 1x 440-00188 blocks

#### Eleventh layer: Install 1x 440-00192 BLOCK 16, NEST, LINAC and 1x 440-00194 BLOCK 17, NEST, LINAC, Note that the orientation is not interchangeable

#### **Verification**: Verify visually that the eleventh layer contains 1x 440-00192 and 1x 440-00194 blocks

|  |  |  |
| --- | --- | --- |
| Item | Part Number | Quantity |
| 11 | 440-00181 BLOCK 11, NEST, LINAC | 2 |
| 12 | 440-00182 BLOCK 12, NEST, LINAC | 1 |
| 13 | 440-00184 BLOCK 13, NEST, LINAC | 1 |
| 14 | 440-00186 BLOCK 14, NEST, LINAC | 1 |
| 15 | 440-00188 BLOCK 15, NEST, LINAC | 1 |
| 16 | 440-00192 BLOCK 16, NEST, LINAC | 1 |
| 17 | 440-00194 BLOCK 17, NEST, LINAC | 1 |

![](data:image/png;base64...)![C:\Users\ttan\AppData\Local\Microsoft\Windows\INetCache\Content.Word\IMG_20171116_110622830.jpg](data:image/jpeg;base64...)

12 (front)

13 (front)

15 (right)

17 (right)

16 (left)

14

(left)

11 (back)

Figure 27: Third Tier

#### Ensure that each mounting hole is aligned properly.

### Fourth Tier Assembly

#### After completing the Third Tier, proceed to assemble the fourth tier

#### While installing each of the Fourth Tier blocks, the LINAC high voltage leads will need to be fed through the center of the part. Ensure that the blocks are oriented properly as this step is being performed.

#### Twelfth layer: Install 1x 440-00203 BLOCK 18, NEST, LINAC

#### **Verification**: Verify visually that the twelfth layer contains 1x 440-00202

#### Thirteenth layer: Install 1x 440-00205 BLOCK 19, NEST, LINAC

#### **Verification**: Verify visually that the thirteenth layer contains 1x 440-00205

#### Fourteenth layer: Install 1x 440-00205 BLOCK 19, NEST, LINAC

#### **Verification**: Verify visually that the fourteenth layer contains 1x 440-00205

#### Fifteenth layer: Install 1x 440-00209 BLOCK 20, NEST, LINAC

#### **Verification**: Verify visually that the fifteenth layer contains 1x 440-00209

|  |  |  |
| --- | --- | --- |
| Item | Part Number | Quantity |
| 18 | 440-00203 BLOCK 18, NEST, LINAC | 1 |
| 19 | 440-00205 BLOCK 19, NEST, LINAC | 2 |
| 20 | 440-00209 BLOCK 20, NEST, LINAC | 1 |

![](data:image/png;base64...)![C:\Users\ttan\AppData\Local\Microsoft\Windows\INetCache\Content.Word\IMG_20171116_112736700-1.jpg](data:image/jpeg;base64...)

Figure : Fourth Tier

![A yellow and black machine  Description automatically generated with medium confidence](data:image/jpeg;base64...)

Figure 29: LINAC High Voltage Leads

#### Ensure that the 1” OD tubing is located in the groove properly and no exposed ground shield touching the lead.

#### Ensure that each mounting hole is aligned properly.

### Top Tier Assembly

#### After completing the Fourth Tier, proceed to the top tier

#### Sixteenth layer: Install 1x 440-00226 BLOCK 21, NEST, LINAC

#### **Verification**: Verify visually that the sixteenth layer contains 1x 440-00226

#### Seventeenth layer: Install 1x 440-00227 BLOCK 22, NEST, LINAC

#### **Verification**: Verify visually that the seventeenth layer contains 1x 440-00227

#### Install tungsten disc 440-00228 DISC, TUNGSTEN, NEST, LINAC

#### **Verification**: Verify visually that the 440-00228 DISC, TUNGSTEN, NEST, LINAC is installed

#### Eighteenth layer: Install 1x 440-00229 BLOCK 23, NEST, LINAC

#### **Verification**: Verify visually that the eighteenth layer contains 1x 440-00229

#### Nineteenth layer: Install 1x 440-00230 BLOCK 24, NEST, LINAC

#### **Verification**: Verify visually that the nineteenth layer contains 1x 440-00230

|  |  |  |
| --- | --- | --- |
| Item | Part Number | Quantity |
| 21 | 440-00226 BLOCK 21, NEST, LINAC | 1 |
| 22 | 440-00227 BLOCK 22, NEST, LINAC | 1 |
| 23 | 440-00228 DISC, TUNGSTEN, NEST, LINAC | 1 |
| 24 | 440-00229 BLOCK 23, NEST, LINAC | 1 |
| 25 | 440-00230 BLOCK 24, NEST, LINAC | 1 |
| 26 | 440-00231 CAP, NEST, LINAC | 1 |
| 27 | 440-00427 MOUNT, CURRENT MONITOR, LEAD NEST | 1 |
| 28 | 440-00232 M14 X 2 X 375 LG., BOLT, NEST, LINAC | 4 |

![](data:image/png;base64...)![C:\Users\ttan\AppData\Local\Microsoft\Windows\INetCache\Content.Word\IMG_20171116_113614267.jpg](data:image/jpeg;base64...)

Figure : Top Tier

#### Ensure that each mounting hole is aligned properly for the top tier. Apply THREADLOCKER, MEDIUM STRENGTH, 243 (P/N: 430-00001) and torque the M14 X 2 X 375 LG., BOLT, NEST, LINAC (P/N: 440-00232) screws to 90 Nm.

90 Nm

243

#### Secure the ground wire lug ring of the EMI jacket onto the Target Supporting Bracket using the existing screw with Flat Washer (450-00548), Star Washer (450-00051) on top of the lug at the location as shown below. Torque to 4Nm (610-00521).

4 Nm

![A close-up of a machine  AI-generated content may be incorrect.](data:image/png;base64...)

Figure : EMI Ground Lug Connection

Attach Brackets

### Reattach BRACKET SPRT W-GUIDE POWER METER (P/N 440-00099). Apply THREADLOCKER MEDIUM STRENGTH, 243 (430-00001) to the 6x M6 screws and torque the following M6 Screws using torque wrench, 610-00523 to 7.6 Nm:

7.6 Nm

243

#### 2X M6 securing Power Meter support bracket (P/N 440-00099) to CLAMP DIRECTIONAL COUPLER BOTTOM (P/N: 440-01181)

#### 2X M6 securing Power Meter support bracket (P/N 440-00099) to the Adjuster Plate bracket (P/N 440-01033)

#### 2X M6 securing Adjuster Plate bracket (P/N 440-01033) to the Adjuster Bracket (440-01059)

![A picture containing diagram  Description automatically generated](data:image/png;base64...)

440-01181

440-01033

440-00099

Figure : Power meter bracket parts

### Reattach Snug-Fit Vibration-Damping Loop (P/N 470-00870), BRACKET, SUPPORT, LINAC ION PUMP MAGNET (P/N 440-00730) and GUARD SHIELD CONNECTOR ION PUMP (P/N 440-00985)

1. Be very careful working around the pump magnet and ion pump as the pump tip and pinch off tube are VERY fragile

#### Mount the 470-00870 Snug-Fit Vibration-Damping Loop Clamp to the 440-00985-GUARD SHIELD CONNECTOR ION PUMP with 1X 450-00050 SCR, SCH, M5 X 0.8 X 10, SST. Apply THREADLOCKER MEDIUM STRENGTH, 243 (P/N: 430-00001) to the M5 screw and torque to 4.5 Nm

4.5 Nm Nm

243

#### Mount 440-00985 GUARD SHIELD CONNECTOR ION PUMP to 440-00730 - BRACKET, SUPPORT, LINAC ION PUMP with 2X 450-00323 WSHR, FLAT, M6, SST and 2X 450-00005 SCR, SCH, M6 X 1.0 X 16, SST. Apply THREADLOCKER, MEDIUM STRENGTH, 243 (P/N: 430-00001) to the M6 screws. Use a torque wrench to torque the M6 screws to 7.6 Nm

243

7.6 Nm

#### Mount the BRACKET, SUPPORT, LINAC ION PUMP MAGNET (P/N: 440-00730) onto the LINAC Bridge with 2x SCR, SCH, M6 X 1.0 X 16, SST (P/N: 450-00005) and 2x WSHR, FLAT, M6, SST (P/N: 450-00323) Apply THREADLOCKER, MEDIUM STRENGTH, 243 (P/N: 430-00001) to the M6 screws to torque to 7.6 Nm.

7.6 Nm

243

![](data:image/png;base64...)

Re-secure ION PUMP MAGNET SUPPORT BRACKET (440-00730)

Re-secure Snug-Fit Vibration-Damping Loop (470-00870)

Re-secure GUARD SHIELD CONNECTOR ION PUMP (440-00985)

Figure . Resecuring 440-00099

### Connect the three LINAC HV cables to their respective connections on the E-Gun Driver.

#### Black “Heater” cable to J3

#### Red “Grid” cable to J4

#### White “Cathode” cable to J5

1. Do not allow HV wires to rotate while tightening connector to the gun driver.
2. Care should be taken not to bend cables to a tighter radius than necessary. Ground Braid should be as far as possible from HV Wire leads and should not move during gantry rotation

![A close-up of a machine  AI-generated content may be incorrect.](data:image/png;base64...)

Figure : E-Gun Driver LINAC HV cable connection

#### Secure the HV Cable onto the Plate with 1x Loop Clamp (470-00931) and 2x Cable Tie (470-00471).

#### Secure the HV Cable Ground Lug and the Ground cable (840-00872) from the Gun Driver onto the Screw with 1x Kep Nut (450-00485) and 1x M4 Washer (450-00321). Torque to 16 in-lbs (610-00549).

16 in-lbs

![A close-up of a machine  AI-generated content may be incorrect.](data:image/png;base64...)

Figure : LINAC HV cable connection

### Remove gantry pin LOTO and turn on breakers on 220V and 480V panel.

MLC Shim Adjustment

### Remove both jaws by loosening and removing 8x SCR, SCH, M5 x 0.8 x 16, STL, ZN (P/N: 450-00405). Be sure to place lower jaws in a safe location such that the front faces are protected. Set aside the hardware that was securing it.

### Fully loosen 4X SCR, SCH, M8 x 1.25 x 25, 12.9 STL, BLUE ZN, DIN 912, ISO 4762 (P/N: 450-00296). Disconnect MLC electrical connections. It should not be necessary to remove any tubing.

![A machine with wires and wires  Description automatically generated](data:image/png;base64...)

Figure : MLC lifted by the couch crane

### Lift the MLC with the couch crane enough to insert shim with a magnet but not enough to strain air tubing.

![A close up of a machine  Description automatically generated](data:image/png;base64...)

Figure : MLC shim aligned with pin and threaded holes

### Insert one or more MLC SHIMs and record how many of each are installed.

#### NOTE: A magnet can typically be used to place the shims

### Slowly and carefully lower the MLC into the Collimation Frame. Be aware of existing cables and hardware already installed in the system ensuring that valve pigtails do not get snagged. Paying attention to the alignment of the MLC with the pins on the MLC mounting blocks. Ensure that the MLC sits flatly against the MLC mounting blocks.

### Tighten and torque the 4x SCR, SCH, M8 x 1.25 x 25, 12.9 STL, BLUE ZN, DIN 912, ISO 4762 (P/N: 450-00296) to 25 Nm

25 Nm

### Reconnect MLC electrical cables

6.4 Nm

### Reinstall jaws with hardware set aside earlier and torque 8X SCR, SCH, M5 x 0.8 x 16, STL, ZN (P/N: 450-00405) screws to 6.4 Nm

Jaw Encoder Adjustment

### Use the Jaw Centering Worksheet (535-00038) to track and calculate the jaw encoder offsets. Do not adjust the index pulse values. For the non-index “Jaw Front” encoder counts, add the encoder offset. For the non-index “Jaw Back” encoder counts, subtract the encoder offset.

### Adjust the jaw offset to the new encoder count for each jaw setting by changing the values for each jaw setting on the Jaws tab of the DeliveryNode tab and select “Calibrate”.

### Verify that the system front jaw and back jaw can move to the 3 cm position. If the 3 cm position can’t be reached, then the parameters should not be saved and further LINAC adjustment is required.

### Print a copy of the worksheet. Sign, date and attach to traveler. Save a copy in “R:\Cross-Functional\MFG\[System Designation]\LINAC Alignment\[YYYYMMDD]”.

### Save the parameters and approve the new profile restart nodes in service mode (restarting RF node is not required)

### Note: The Jaw Sweep only uses the new parameters if the node is restarted with the new profile

**END OF DOCUMENT**