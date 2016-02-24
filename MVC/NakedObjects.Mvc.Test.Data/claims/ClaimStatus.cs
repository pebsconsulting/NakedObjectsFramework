// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System.ComponentModel.DataAnnotations;
using NakedObjects;

namespace Expenses {
    namespace ExpenseClaims {
        [Bounded, Immutable(WhenTo.OncePersisted)]
        public class ClaimStatus : Status {
            [Hidden(WhenTo.Always), Key]
            public int Id { get; set; }

            #region Status tests

            [Hidden(WhenTo.Always)]
            public bool IsNew() {
                return TitleString.Equals(NEW_STATUS);
            }

            [Hidden(WhenTo.Always)]
            public bool IsSubmitted() {
                return TitleString.Equals(SUBMITTED);
            }

            [Hidden(WhenTo.Always)]
            public bool IsReturned() {
                return TitleString.Equals(RETURNED);
            }

            [Hidden(WhenTo.Always)]
            public bool IsToBePaid() {
                return TitleString.Equals(TO_BE_PAID);
            }

            [Hidden(WhenTo.Always)]
            public bool IsPaid() {
                return TitleString.Equals(PAID);
            }

            #endregion

            #region Status definitions

            public static string NEW_STATUS = "New";
            public static string PAID = "Paid";

            public static string RETURNED = "Returned To Claimant";
            public static string SUBMITTED = "Submitted For Approval";

            public static string TO_BE_PAID = "Ready to be paid";

            #endregion
        }
    }
} //end of root namespace