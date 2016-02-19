using NakedObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AdventureWorksModel {
    public partial class PhoneNumberType {
        [NakedObjectsIgnore]
        public virtual int PhoneNumberTypeID { get; set; }
        [Title][Hidden(WhenTo.Always)]
        public virtual string Name { get; set; }
        [NakedObjectsIgnore]
        [ConcurrencyCheck]
        public virtual DateTime ModifiedDate { get; set; }
    }
}
