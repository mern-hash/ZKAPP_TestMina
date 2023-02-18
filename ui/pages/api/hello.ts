// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("object");
  if (req.method == "GET") {
    console.log("object");
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://sellercentral.amazon.in/performance/detail/shipping?t=cr&ref=sp_st_dash_csp_car",
      headers: {
        authority: "sellercentral.amazon.in",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
        "cache-control": "max-age=0",
        cookie:
          'session-id=262-7879717-5169137; ubid-acbin=257-1273715-4474749; __Host-mselc=H4sIAAAAAAAA/6tWSs5MUbJSSsytyjPUS0xOzi/NK9HLT85M0XM0DPE0inI3NfZ28nUOUtJRykVSmZtalJyRCFKKRV02ssICkBIjwxCvoNBQPxNv9zClWgChzu4adQAAAA==; __Host_mlang=en_IN; ld=inrgooginkenshoo_502X1069928_e_c_630646159638_asret__become_Navreg; AMCVS_A7493BC75245ACD20A490D4D%40AdobeOrg=1; AMCV_A7493BC75245ACD20A490D4D%40AdobeOrg=1585540135%7CMCIDTS%7C19406%7CMCMID%7C33479615651563642040046264681910167815%7CMCAAMLH-1677229699%7C12%7CMCAAMB-1677229699%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1676632099s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; s_ips=625; s_tp=2309; s_ppv=SC%253AIN%253AWP-Welcome%2C27%2C27%2C625%2C1%2C3; gpv_pn=SC%3AIN%3AWP-Welcome; s_vnc365=1708160899736%26vn%3D5; s_ivc=true; s_cc=true; s_nr365=1676624903295-Repeat; s_sq=amznsrvsglobalprod%252Camznsrvseumainprod%252Camznsrvsinprod%3D%2526c.%2526a.%2526activitymap.%2526page%253DSC%25253AIN%25253AWP-Welcome%2526link%253DLog%252520in%2526region%253Dsc-content-container%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253DSC%25253AIN%25253AWP-Welcome%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fsellercentral.amazon.in%25252Fsignin%25253Fref_%25253Dscin_soa_wp_signin_n%252526mons_sel_locale%25253Den_IN%252526initialSessio%2526ot%253DA; csm-hit=tb:GQSFEA9Q31PTEE5BMQPG+s-DBDWAA10T7BYEQSZ9SNG|1676625173150&t:1676625173150&adb:adblk_no; session-id-time=2307345182l; session-token=Ms/T2Wq2xcbJC6EA5/y/Y7EemWZCoPxNJ3N9fZKOwvOfdnFiqoCGr2GUXrYjXbw9c/ITWSq8ZrsaqFBsZA5+Y88uDixfdVb73rgz/G7qczuD3muciSpPSZ6T7aa6A894kelw8pwnC7RDMw9QBtBkltOLs2xJfavPS7ckb+usjDrR7LL1s7yJ/pJrpN3J7l4U+L/V65Y4NLqC2eehbjnHAaAlTaR1n8HnmQOITUHi/vLpw0eoURKmXzvanYyx6sBV; x-acbin="C8xCgbCJUqIOxVeHNRC9PCL5Z9r22vOEPQaz4v9w^@rnUke2qMZ6SKbXOsBf4CDk8"; at-acbin=Atza|IwEBIBKUvJt4IbBttmramDXESlL6uDLJ0eWEYNWGHs4VsYSqcHdPbt5PDIMEUxER-LvUBUYGB5D5XEp0ktjbJHo0Zd26Oox_Lqp2szbc48MoGIP0tmyURZQxAXBQQ8FqdBZPsN1qh-G2uoef5Y6mVaBtxHB-tz-Et57VWh0EriJpbuOeyHJ3rrF9jr7PwJPIRQHxOEek8hpzpA6J-Jh9xtfANzslSPQBZYhYqkvp3iETGNEQV_0aaQlfzu6q2UXTjHnrpHnEkLlglPu5FHz90qNiRs00S9C7Z1I_G-D-OW90tFAjYQ; sess-at-acbin="6ilD80BpIw98BTz7+R5rGtONKNvHIwcL33ZOSiJ2lOo="; sst-acbin=Sst1|PQG96jRThEpcJ7MGdGXRVAgoCV0YZlERGpDYujEwxr7Oc-S470OS1qj_7lOGThueSuwwQRmO0OXHkruuIT2z1yzJJdvlgUuk8AVWoq0CtUqHROcOsDC8MNSj0LSMLR_jJO9sScCVicaHZ2Cu8J66diCh0PzIQ9oa1XDUFyxbAciNJ6fabGk5yiaVFRwQpiWhDqKMEjMQ4dKAeY9MCSrtkyBx9HUqjumol6Np4BCHHUKv9iI5uKeiIuMQvsLzf_NCMmLZEMQ7rhMJ8QwxrsOvjxc44ivesugGuWU7UKKaSschkmg; session-id=262-7879717-5169137; session-id-time=2306830103l; session-token=fPjUrZUSeiq4ysvD40VkEogaxLBygg2NqUo+yU3jEVk3Y/BkYBR/aFG4yL086WmKhAXqL6/X39Ikr9HIxGpyw/+ehe3Yowkx19OGYdvoUuiA0VoOnS3Dn/pV04Bbon5koFLwkjs90bCjqEfVg5EreN5yTP3KjPK+IXS8+IuWhXgIVss5VHmlqYrJKJc9ffDQIIQk4hEVepUMhpY7GiDXOrq8POlfL2TL7aLJNO4y3eBh9nwPkXxsVQ==; ubid-acbin=257-1273715-4474749; x-acbin=W2pbLTDnuRwr1Rsi1TO6VUKr1VVYSZVpuQJU2v8EWOj6JskFVRjzziKFOKUloDx5',
        referer: "https://sellercentral.amazon.in/performance/dashboard",
        "sec-ch-ua":
          '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    };

    const { data } = await axios(config);
    console.log(data);
    res.status(200).send(data);
  } else {
    res.status(200).json({ name: "John Doe" });
  }
}
