// https://opensource.org/comment/1105#comment-1105
const raw = `
0-clause BSD License (0BSD)
1-clause BSD License (BSD-1-Clause)
2-clause BSD License (BSD-2-Clause)
3-clause BSD License (BSD-3-Clause)
Academic Free License 3.0 (AFL-3.0)
Adaptive Public License (APL-1.0)
Apache Software License 1.1 (Apache-1.1) (superseded)
Apache License 2.0 (Apache-2.0)
Apple Public Source License (APSL-2.0)
Artistic license 1.0 (Artistic-1.0) (superseded)
Artistic License 2.0 (Artistic-2.0)
Attribution Assurance License (AAL)
Boost Software License (BSL-1.0)
3-clause BSD License
2-clause BSD License
1-clause BSD License
0-clause BSD license
BSD-3-Clause-LBNL
BSD+Patent (BSD-2-Clause-Patent)
CERN Open Hardware Licence Version 2 - Permissive
CERN Open Hardware Licence Version 2 - Weakly Reciprocal
CERN Open Hardware Licence Version 2 - Strongly Reciprocal
CeCILL License 2.1 (CECILL-2.1)
Common Development and Distribution License 1.0 (CDDL-1.0)
Common Public Attribution License 1.0 (CPAL-1.0)
Common Public License 1.0 (CPL-1.0) (superseded)
Computer Associates Trusted Open Source License 1.1 (CATOSL-1.1)
Cryptographic Autonomy License v.1.0 (CAL-1.0)
CUA Office Public License Version 1.0 (CUA-OPL-1.0) (retired)
Eclipse Public License 1.0 (EPL-1.0) (superseded)
Eclipse Public License 2.0 (EPL-2.0)
eCos License version 2.0 (eCos-2.0)
Educational Community License, Version 1.0 (ECL-1.0) (superseded)
Educational Community License, Version 2.0 (ECL-2.0)
Eiffel Forum License V1.0 (EFL-1.0) (superseded)
Eiffel Forum License V2.0 (EFL-2.0)
Entessa Public License (Entessa)
EU DataGrid Software License (EUDatagrid)
European Union Public License 1.2 (EUPL-1.2) (links to every language's version on their site)
Fair License (Fair)
Frameworx License (Frameworx-1.0)
Free Public License 1.0.0 (0BSD)
GNU Affero General Public License version 3 (AGPL-3.0)
GNU General Public License version 2 (GPL-2.0)
GNU General Public License version 3 (GPL-3.0)
GNU Lesser General Public License version 2.1 (LGPL-2.1)
GNU Lesser General Public License version 3 (LGPL-3.0)
Historical Permission Notice and Disclaimer (HPND)
IBM Public License 1.0 (IPL-1.0)
Intel Open Source License (Intel) (retired)
IPA Font License (IPA)
ISC License (ISC)
Jabber Open Source License (retired)
JAM License (Jam)
LaTeX Project Public License 1.3c (LPPL-1.3c)
Lawrence Berkeley National Labs BSD Variant License (BSD-3-Clause-LBNL)
Licence Libre du Québec – Permissive (LiLiQ-P) version 1.1 (LiliQ-P)
Licence Libre du Québec – Réciprocité (LiLiQ-R) version 1.1 (LiliQ-R)
Licence Libre du Québec – Réciprocité forte (LiLiQ-R+) version 1.1 (LiliQ-R+)
Lucent Public License ("Plan9"), version 1.0 (LPL-1.0) (superseded)
Lucent Public License Version 1.02 (LPL-1.02)
Microsoft Public License (MS-PL)
Microsoft Reciprocal License (MS-RL)
MirOS Licence (MirOS)
MIT License (MIT)
MIT No Attribution License (MIT-0)
MITRE Collaborative Virtual Workspace License (CVW) (retired)
Motosoto License (Motosoto)
Mozilla Public License 1.0 (MPL-1.0) (superseded)
Mozilla Public License 1.1 (MPL-1.1) (superseded)
Mozilla Public License 2.0 (MPL-2.0)
Mulan Permissive Software License v2 (MulanPSL - 2.0)
Multics License (Multics)
NASA Open Source Agreement 1.3 (NASA-1.3)
Naumen Public License (Naumen)
Nethack General Public License (NGPL)
Nokia Open Source License (Nokia)
Non-Profit Open Software License 3.0 (NPOSL-3.0)
NTP License (NTP)
OCLC Research Public License 2.0 (OCLC-2.0)
Open Group Test Suite License (OGTSL)
Open Software License 1.0 (OSL-1.0) (superseded)
Open Software License 2.1 (OSL-2.1) (superseded)
Open Software License 3.0 (OSL-3.0)
OpenLDAP Public License Version 2.8 (OLDAP-2.8)
OSET Public License version 2.1
PHP License 3.0 (PHP-3.0) (superseded)
PHP License 3.01 (PHP-3.01)
The PostgreSQL License (PostgreSQL)
Python License (Python-2.0) (overall Python license)
CNRI Python license (CNRI-Python) (CNRI portion of Python License)
Q Public License (QPL-1.0)
RealNetworks Public Source License V1.0 (RPSL-1.0)
Reciprocal Public License, version 1.1 (RPL-1.1) (superseded)
Reciprocal Public License 1.5 (RPL-1.5)
Ricoh Source Code Public License (RSCPL)
SIL Open Font License 1.1 (OFL-1.1)
Simple Public License 2.0 (SimPL-2.0)
Sleepycat License (Sleepycat)
Sun Industry Standards Source License (SISSL) (retired)
Sun Public License 1.0 (SPL-1.0)
Sybase Open Watcom Public License 1.0 (Watcom-1.0)
Universal Permissive License (UPL)
University of Illinois/NCSA Open Source License (NCSA)
Upstream Compatibility License v1.0
Unicode Data Files and Software License
The Unlicense
Vovida Software License v. 1.0 (VSL-1.0)
W3C License (W3C)
wxWindows Library License (WXwindows)
X.Net License (Xnet)
Zero-Clause BSD (0BSD)
Zope Public License 2.0 (ZPL-2.0) (superseded)
Zope Public License 2.1 (ZPL-2.1)
zlib/libpng license (Zlib)
`

const licenses = raw
  .trim()
  .split('\n')
  .reduce((m, l) => {
    const [full, name, alias] = l
      .match(/(?:(^.+)\s\(([A-Z][A-Za-z\d \-+.]+)\).*)?$/)

    m.push(full, name, alias)

    return m
  }, [])
  .filter(v => v)
  .map(l = l.toLowerCase())

module.exports = {
  rules: [{
    policy: 'deny',
    filter: ({license}) => !licenses.includes(license.toLowerCase())
  }]
}
